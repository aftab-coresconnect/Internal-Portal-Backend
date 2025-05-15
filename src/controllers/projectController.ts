import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Project, { IProject } from '../models/Project';
import Milestone from '../models/Milestone';
import Client from '../models/Client';

// Get all projects
export const getAllProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const projects = await Project.find().populate('assignedDevelopers', 'name email role');
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects', error });
  }
};

// Get project by ID
export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('assignedDevelopers', 'name email role')
      .populate('milestones');
    
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }
    
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project', error });
  }
};

// Create new project
export const createProject = async (req: Request, res: Response): Promise<void> => {
  console.log('[createProject] Starting project creation');
  console.log('[createProject] Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    // Skip transactions for better compatibility
    console.log('[createProject] Proceeding without transactions for better compatibility');
    
    const {
      title,
      description,
      clientId,
      clientName,
      status,
      priority,
      figmaLink,
      repoLink,
      jiraLink,
      startDate,
      deadline,
      techStack,
      assignedDevelopers,
      projectManager,
      budget,
      tags,
      initialMilestones
    } = req.body;

    console.log('[createProject] Extracted data:', { 
      title, clientId, clientName, status, 
      assignedDevelopers: Array.isArray(assignedDevelopers) ? assignedDevelopers.length : 'not an array',
      budget: typeof budget === 'string' ? 'string: ' + budget : budget
    });

    // Check if client exists
    if (clientId) {
      console.log('[createProject] Checking if client exists:', clientId);
      const clientExists = await Client.findById(clientId);
      if (!clientExists) {
        console.log('[createProject] Client not found:', clientId);
        res.status(404).json({ message: 'Client not found' });
        return;
      }
      console.log('[createProject] Client found:', clientExists._id);
    }

    // Parse budget to number if it's a string
    let parsedBudget = budget;
    if (typeof budget === 'string') {
      parsedBudget = parseFloat(budget) || 0;
      console.log('[createProject] Parsed budget from string:', budget, 'to number:', parsedBudget);
    }

    // Create the project
    console.log('[createProject] Creating new project');
    const newProject = new Project({
      title,
      description,
      clientId,
      clientName,
      status,
      priority,
      figmaLink,
      repoLink,
      jiraLink,
      startDate,
      deadline,
      techStack,
      assignedDevelopers,
      projectManager,
      budget: parsedBudget,
      tags
    });

    console.log('[createProject] Saving project');
    const savedProject = await newProject.save();
    console.log('[createProject] Project saved with ID:', savedProject._id);
    
    // If there are initial milestones, create them
    if (initialMilestones && initialMilestones.length > 0) {
      console.log('[createProject] Processing initial milestones:', initialMilestones.length);
      const milestonePromises = initialMilestones.map(async (milestone: any) => {
        console.log('[createProject] Creating milestone:', milestone.title);
        const newMilestone = new Milestone({
          title: milestone.title,
          description: milestone.description,
          project: savedProject._id,
          status: milestone.status,
          startDate: milestone.startDate,
          dueDate: milestone.dueDate,
          priority: milestone.priority,
          assignedTo: milestone.assignedTo || [],
          progressPercentage: 0
        });
        
        const savedMilestone = await newMilestone.save();
        console.log('[createProject] Milestone saved with ID:', savedMilestone._id);
        return savedMilestone._id;
      });
      
      try {
        const milestoneIds = await Promise.all(milestonePromises);
        console.log('[createProject] All milestones created:', milestoneIds.length);
        
        // Update the project with milestone references
        savedProject.milestones = milestoneIds;
        await savedProject.save();
        
        console.log('[createProject] Project updated with milestone references');
      } catch (milestoneError) {
        console.error('[createProject] Error creating milestones:', milestoneError);
        throw milestoneError;
      }
    }
    
    // Link project to client
    if (clientId) {
      console.log('[createProject] Linking project to client:', clientId);
      await Client.findByIdAndUpdate(
        clientId,
        { $addToSet: { linkedProjects: savedProject._id } }
      );
      console.log('[createProject] Project linked to client');
    }
    
    // Return the project with populated fields
    console.log('[createProject] Fetching populated project');
    const populatedProject = await Project.findById(savedProject._id)
      .populate('assignedDevelopers', 'name email role')
      .populate('projectManager', 'name email role')
      .populate('milestones');
      
    console.log('[createProject] Successfully created project');
    res.status(201).json(populatedProject);
  } catch (error) {
    console.error('[createProject] Error:', error instanceof Error ? error.message : String(error));
    console.error('[createProject] Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    res.status(500).json({ 
      message: 'Error creating project', 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
};

// Update project
export const updateProject = async (req: Request, res: Response): Promise<void> => {
  console.log('[updateProject] Starting update for project ID:', req.params.id);
  console.log('[updateProject] Update data:', JSON.stringify(req.body, null, 2));
  
  // Check if MongoDB deployment supports transactions by checking topology type
  const db = mongoose.connection.db;
  const admin = db.admin();
  let useTransactions = false;
  let session = null;
  
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Check if project exists first, outside any transaction
    console.log('[updateProject] Checking if project exists');
    const existingProject = await Project.findById(id);
    if (!existingProject) {
      console.log('[updateProject] Project not found:', id);
      res.status(404).json({ message: 'Project not found' });
      return;
    }
    
    console.log('[updateProject] Project found:', existingProject._id);
    
    // Skip transactions completely for update operations
    console.log('[updateProject] Proceeding without transactions for better compatibility');
    
    // If clientId is being updated, validate new client exists
    if (updateData.clientId) {
      console.log('[updateProject] Checking client data');
      // Convert clientId to string safely
      const existingClientId = existingProject.clientId ? existingProject.clientId.toString() : null;
      const newClientId = updateData.clientId;
      
      console.log('[updateProject] Client IDs - Existing:', existingClientId, 'New:', newClientId);
      
      // Only process if the client is actually changing
      if (newClientId !== existingClientId) {
        console.log('[updateProject] Client change detected');
        
        const newClient = await Client.findById(newClientId);
        if (!newClient) {
          console.log('[updateProject] New client not found:', newClientId);
          res.status(404).json({ message: 'New client not found' });
          return;
        }
        
        console.log('[updateProject] New client found:', newClient._id);
        
        // Remove project from old client's linkedProjects
        if (existingClientId) {
          console.log('[updateProject] Removing project from old client');
          await Client.findByIdAndUpdate(
            existingClientId,
            { $pull: { linkedProjects: existingProject._id } }
          );
        }
        
        // Add project to new client's linkedProjects
        console.log('[updateProject] Adding project to new client');
        await Client.findByIdAndUpdate(
          newClientId,
          { $addToSet: { linkedProjects: existingProject._id } }
        );
        
        // Make sure clientName is also updated if not explicitly set
        if (!updateData.clientName) {
          console.log('[updateProject] Auto-updating clientName to:', newClient.name);
          updateData.clientName = newClient.name;
        }
      }
    }
    
    // Update the project
    console.log('[updateProject] Updating project with data');
    
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('assignedDevelopers', 'name email role')
      .populate('projectManager', 'name email role')
      .populate('milestones');
    
    if (!updatedProject) {
      console.log('[updateProject] Project not found during update');
      res.status(404).json({ message: 'Project not found' });
      return;
    }
    
    console.log('[updateProject] Project updated successfully');
    res.status(200).json(updatedProject);
  } catch (error) {
    console.error('[updateProject] Error:', error instanceof Error ? error.message : String(error));
    console.error('[updateProject] Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    res.status(500).json({ 
      message: 'Error updating project', 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
};

// Delete project
export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  console.log('[deleteProject] Starting deletion for project ID:', req.params.id);
  
  try {
    // Skip transactions for better compatibility
    console.log('[deleteProject] Proceeding without transactions for better compatibility');
    
    const { id } = req.params;
    
    // Find the project to get its clientId before deleting
    const project = await Project.findById(id);
    
    if (!project) {
      console.log('[deleteProject] Project not found:', id);
      res.status(404).json({ message: 'Project not found' });
      return;
    }
    
    // Remove project from client's linkedProjects
    if (project.clientId) {
      console.log('[deleteProject] Removing project from client:', project.clientId);
      
      const clientExists = await Client.findById(project.clientId);
        
      if (clientExists) {
        console.log('[deleteProject] Client found, updating');
        
        await Client.findByIdAndUpdate(
          project.clientId,
          { $pull: { linkedProjects: project._id } }
        );
      } else {
        console.warn(`[deleteProject] Client ${project.clientId} referenced by project ${id} not found`);
      }
    }
    
    // Delete related milestones
    if (project.milestones && project.milestones.length > 0) {
      console.log('[deleteProject] Deleting related milestones');
      
      const deleteResult = await Milestone.deleteMany({ project: id });
        
      console.log(`[deleteProject] Deleted ${deleteResult.deletedCount} milestones for project ${id}`);
    }
    
    // Delete the project
    console.log('[deleteProject] Deleting project');
    
    const deletedProject = await Project.findByIdAndDelete(id);
    
    if (!deletedProject) {
      console.log('[deleteProject] Project not found during deletion');
      res.status(404).json({ message: 'Project not found during deletion' });
      return;
    }
    
    console.log('[deleteProject] Project deleted successfully');
    
    res.status(200).json({ 
      message: 'Project deleted successfully',
      deletedProject: {
        id: deletedProject._id,
        title: deletedProject.title
      }
    });
  } catch (error) {
    console.error('[deleteProject] Error:', error instanceof Error ? error.message : String(error));
    console.error('[deleteProject] Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    res.status(500).json({ 
      message: 'Error deleting project', 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
};

// Get projects by user ID (for a specific user's dashboard)
export const getUserProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId || req.user?._id;
    
    if (!userId) {
      res.status(400).json({ message: 'User ID is required' });
      return;
    }
    
    // Find all projects where the user is assigned as a developer or project manager
    const projects = await Project.find({
      $or: [
        { assignedDevelopers: userId },
        { projectManager: userId }
      ]
    })
    .populate('assignedDevelopers', 'name email role')
    .populate('clientId', 'name companyName')
    .populate('projectManager', 'name email')
    .sort({ deadline: 1 }); // Sort by nearest deadline first
    
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({ 
      message: 'Error fetching user projects', 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}; 