import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Project, { IProject } from '../models/Project';
import Milestone from '../models/Milestone';

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
  // Start a transaction to ensure all operations succeed or fail together
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const {
      title,
      description,
      clientName,
      status,
      figmaLink,
      repoLink,
      jiraLink,
      startDate,
      deadline,
      techStack,
      assignedDevelopers,
      initialMilestones
    } = req.body;

    // Create the project first
    const newProject = new Project({
      title,
      description,
      clientName,
      status,
      figmaLink,
      repoLink,
      jiraLink,
      startDate,
      deadline,
      techStack,
      assignedDevelopers
    });

    const savedProject = await newProject.save({ session });
    
    // If there are initial milestones, create them
    if (initialMilestones && initialMilestones.length > 0) {
      const milestonePromises = initialMilestones.map(async (milestone: any) => {
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
        
        const savedMilestone = await newMilestone.save({ session });
        return savedMilestone._id;
      });
      
      const milestoneIds = await Promise.all(milestonePromises);
      
      // Update the project with milestone references
      savedProject.milestones = milestoneIds;
      await savedProject.save({ session });
    }
    
    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
    
    // Return the project with populated fields
    const populatedProject = await Project.findById(savedProject._id)
      .populate('assignedDevelopers', 'name email role')
      .populate('milestones');
      
    res.status(201).json(populatedProject);
  } catch (error) {
    // Abort the transaction in case of error
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: 'Error creating project', error });
  }
};

// Update project
export const updateProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      clientName,
      status,
      figmaLink,
      repoLink,
      jiraLink,
      startDate,
      deadline,
      techStack,
      assignedDevelopers
    } = req.body;

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        clientName,
        status,
        figmaLink,
        repoLink,
        jiraLink,
        startDate,
        deadline,
        techStack,
        assignedDevelopers
      },
      { new: true }
    ).populate('assignedDevelopers', 'name email role');

    if (!updatedProject) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Error updating project', error });
  }
};

// Delete project
export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);
    
    if (!deletedProject) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }
    
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project', error });
  }
}; 