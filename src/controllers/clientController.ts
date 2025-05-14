import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Client, { IClient } from '../models/Client';

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
      phone,
      companyName,
      website,
      address,
      notes = [],
      painPoints = []
    } = req.body;

    // Check if email already exists
    const emailExists = await Client.findOne({ email });
    if (emailExists) {
      res.status(400).json({ message: 'Email already in use' });
      return;
    }

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
    const {
      name,
      email,
      phone,
      companyName,
      website,
      address,
      notes,
      painPoints
    } = req.body;

    // Check if new email already exists for different client
    if (email) {
      const emailExists = await Client.findOne({ email, _id: { $ne: req.params.id } });
      if (emailExists) {
        res.status(400).json({ message: 'Email already in use by another client' });
        return;
      }
    }

    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        phone,
        companyName,
        website,
        address,
        notes,
        painPoints
      },
      { new: true }
    );

    if (!updatedClient) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }

    res.status(200).json(updatedClient);
  } catch (error) {
    res.status(500).json({ message: 'Error updating client', error });
  }
};

// Delete client
export const deleteClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    
    if (!client) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }
    
    res.status(200).json({ message: 'Client deleted successfully' });
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