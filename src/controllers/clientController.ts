import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Client, { IClient } from '../models/Client';
import Developer from '../models/Developer';
import bcrypt from 'bcryptjs';

// Get all clients
export const getAllClients = async (req: Request, res: Response): Promise<void> => {
  try {
    const clients = await Client.find();
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching clients', error });
  }
};

// Get client by ID
export const getClientById = async (req: Request, res: Response): Promise<void> => {
  try {
    const client = await Client.findById(req.params.id)
      .populate('linkedProjects', 'title status startDate deadline');
    
    if (!client) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }
    
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching client', error });
  }
};

// Create a new client
export const createClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      email,
      password,
      phone,
      companyName,
      website,
      address,
      notes = [],
      painPoints = []
    } = req.body;

    // Check if email already exists in Client model
    const emailExists = await Client.findOne({ email });
    if (emailExists) {
      res.status(400).json({ message: 'Email already in use' });
      return;
    }

    // Check if email already exists in User model
    const userExists = await Developer.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: 'Email already in use by a user' });
      return;
    }

    // Create client record
    const newClient = new Client({
      name,
      email,
      phone,
      companyName,
      website,
      address,
      notes,
      painPoints
    });

    // Create a corresponding user with 'client' role if password is provided
    if (password) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      await Developer.create({
        name,
        email,
        password: hashedPassword,
        role: 'client',
        title: companyName // Store company name in the title field
      });
    }

    const savedClient = await newClient.save();
    res.status(201).json(savedClient);
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Error creating client', 
      error: error.message 
    });
  }
};

// Update client
export const updateClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }

    const {
      name,
      email,
      password,
      phone,
      companyName,
      website,
      address,
      notes,
      painPoints
    } = req.body;

    // If email is changed, check if it's already in use
    if (email && email !== client.email) {
      const emailExists = await Client.findOne({ email });
      if (emailExists) {
        res.status(400).json({ message: 'Email already in use' });
        return;
      }

      const userExists = await Developer.findOne({ email });
      if (userExists) {
        res.status(400).json({ message: 'Email already in use by a user' });
        return;
      }
    }

    // Update client
    client.name = name || client.name;
    client.email = email || client.email;
    client.phone = phone || client.phone;
    client.companyName = companyName || client.companyName;
    client.website = website || client.website;
    
    if (address) {
      client.address = {
        ...client.address,
        ...address
      };
    }
    
    if (notes) client.notes = notes;
    if (painPoints) client.painPoints = painPoints;

    // Update the corresponding user if it exists
    if (name || email || password || companyName) {
      const user = await Developer.findOne({ email: client.email, role: 'client' });
      
      if (user) {
        if (name) user.name = name;
        if (email) user.email = email;
        if (companyName) user.title = companyName;
        
        if (password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(password, salt);
        }
        
        await user.save();
      } 
      // If user doesn't exist but we have password, create it
      else if (password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        await Developer.create({
          name: name || client.name,
          email: email || client.email,
          password: hashedPassword,
          role: 'client',
          title: companyName || client.companyName
        });
      }
    }

    const updatedClient = await client.save();
    res.status(200).json(updatedClient);
  } catch (error) {
    res.status(500).json({ message: 'Error updating client', error });
  }
};

// Delete client
export const deleteClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }
    
    // Delete corresponding user if it exists
    await Developer.deleteOne({ email: client.email, role: 'client' });
    
    // Delete client
    await client.deleteOne();
    
    res.status(200).json({ message: 'Client deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting client', error });
  }
};

// Add a project to client's linkedProjects
export const linkProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientId, projectId } = req.params;
    
    // Check if project is already linked
    const client = await Client.findById(clientId);
    if (!client) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }
    
    if (client.linkedProjects?.includes(projectId as unknown as mongoose.Types.ObjectId)) {
      res.status(400).json({ message: 'Project already linked to this client' });
      return;
    }
    
    // Add project to linkedProjects
    const updatedClient = await Client.findByIdAndUpdate(
      clientId,
      { $push: { linkedProjects: projectId } },
      { new: true }
    ).populate('linkedProjects', 'title status startDate deadline');
    
    res.status(200).json(updatedClient);
  } catch (error) {
    res.status(500).json({ message: 'Error linking project', error });
  }
};

// Remove a project from client's linkedProjects
export const unlinkProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientId, projectId } = req.params;
    
    const updatedClient = await Client.findByIdAndUpdate(
      clientId,
      { $pull: { linkedProjects: projectId } },
      { new: true }
    ).populate('linkedProjects', 'title status startDate deadline');
    
    if (!updatedClient) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }
    
    res.status(200).json(updatedClient);
  } catch (error) {
    res.status(500).json({ message: 'Error unlinking project', error });
  }
}; 