import { Request, Response } from 'express';
import Milestone, { IMilestone } from '../models/Milestone';
import Project from '../models/Project';
import mongoose from 'mongoose';

// Get all milestones for a project
export const getProjectMilestones = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const milestones = await Milestone.find({ project: projectId })
      .populate('assignedTo', 'name email role')
      .populate('dependencies', 'title status');
    
    res.status(200).json(milestones);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching milestones', error });
  }
};

// Get milestone by ID
export const getMilestoneById = async (req: Request, res: Response): Promise<void> => {
  try {
    const milestone = await Milestone.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('dependencies', 'title status');
    
    if (!milestone) {
      res.status(404).json({ message: 'Milestone not found' });
      return;
    }
    
    res.status(200).json(milestone);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching milestone', error });
  }
};

// Create new milestone
export const createMilestone = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      project,
      status,
      startDate,
      dueDate,
      priority,
      assignedTo = [],
      dependencies = [],
      progressPercentage = 0,
      notes = [],
      attachments = []
    } = req.body;

    console.log('Creating milestone with data:', {
      title,
      description,
      project,
      status,
      startDate,
      dueDate,
      priority,
      assignedTo,
      progressPercentage
    });

    // Ensure project exists before creating milestone
    const projectExists = await Project.findById(project);
    if (!projectExists) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    // Create the milestone
    const newMilestone = new Milestone({
      title,
      description,
      project,
      status,
      startDate,
      dueDate,
      priority,
      assignedTo: assignedTo || [],
      dependencies: dependencies || [],
      progressPercentage: progressPercentage || 0,
      notes: notes || [],
      attachments: attachments || []
    });

    const savedMilestone = await newMilestone.save();
    
    // Update the project to include this milestone
    await Project.findByIdAndUpdate(
      project,
      { $push: { milestones: savedMilestone._id } }
    );
    
    // Return the milestone with populated fields
    const populatedMilestone = await Milestone.findById(savedMilestone._id)
      .populate('assignedTo', 'name email role')
      .populate('dependencies', 'title status');
      
    res.status(201).json(populatedMilestone);
  } catch (error: any) {
    console.error('Error creating milestone:', error);
    res.status(500).json({ 
      message: 'Error creating milestone', 
      error: error.message || String(error) 
    });
  }
};

// Update milestone
export const updateMilestone = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      status,
      startDate,
      dueDate,
      completedDate,
      priority,
      assignedTo,
      dependencies,
      progressPercentage,
      notes,
      attachments
    } = req.body;

    const updatedMilestone = await Milestone.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        status,
        startDate,
        dueDate,
        completedDate,
        priority,
        assignedTo,
        dependencies,
        progressPercentage,
        notes,
        attachments
      },
      { new: true }
    )
    .populate('assignedTo', 'name email role')
    .populate('dependencies', 'title status');

    if (!updatedMilestone) {
      res.status(404).json({ message: 'Milestone not found' });
      return;
    }

    res.status(200).json(updatedMilestone);
  } catch (error) {
    res.status(500).json({ message: 'Error updating milestone', error });
  }
};

// Delete milestone
export const deleteMilestone = async (req: Request, res: Response): Promise<void> => {
  try {
    const milestone = await Milestone.findById(req.params.id);
    
    if (!milestone) {
      res.status(404).json({ message: 'Milestone not found' });
      return;
    }
    
    // Remove the milestone reference from the project
    await Project.findByIdAndUpdate(
      milestone.project,
      { $pull: { milestones: req.params.id } }
    );
    
    // Delete the milestone
    await Milestone.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Milestone deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting milestone:', error);
    res.status(500).json({ 
      message: 'Error deleting milestone', 
      error: error.message || String(error) 
    });
  }
}; 