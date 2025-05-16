import { Request, Response } from 'express';
import ProjectManager from '../models/ProjectManager';
import Project from '../models/Project';
import mongoose from 'mongoose';

// Get all project managers
export const getAllProjectManagers = async (req: Request, res: Response): Promise<void> => {
  try {
    const projectManagers = await ProjectManager.find()
      .populate('managedProjects', 'title status deadline')
      .select('-password');
    res.status(200).json(projectManagers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project managers', error });
  }
};

// Get project manager by ID
export const getProjectManagerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const projectManager = await ProjectManager.findById(req.params.id)
      .populate('managedProjects', 'title status deadline progressPercent')
      .select('-password');
    
    if (!projectManager) {
      res.status(404).json({ message: 'Project manager not found' });
      return;
    }
    
    res.status(200).json(projectManager);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project manager', error });
  }
};

// Update project manager metrics
export const updateProjectManagerMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      onTimeDeliveryRate,
      blockerResolutionTime,
      clientSatisfactionScore,
      teamFeedbackScore,
      resourceUtilization,
      projectMetrics
    } = req.body;

    const updatedManager = await ProjectManager.findByIdAndUpdate(
      id,
      {
        $set: {
          onTimeDeliveryRate,
          blockerResolutionTime,
          clientSatisfactionScore,
          teamFeedbackScore,
          resourceUtilization,
          projectMetrics
        }
      },
      { new: true, runValidators: true }
    )
    .populate('managedProjects', 'title status deadline')
    .select('-password');

    if (!updatedManager) {
      res.status(404).json({ message: 'Project manager not found' });
      return;
    }

    res.status(200).json(updatedManager);
  } catch (error) {
    res.status(500).json({ message: 'Error updating project manager metrics', error });
  }
};

// Get project manager's performance metrics
export const getProjectManagerMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const projectManager = await ProjectManager.findById(id)
      .select('onTimeDeliveryRate blockerResolutionTime clientSatisfactionScore teamFeedbackScore resourceUtilization projectMetrics');

    if (!projectManager) {
      res.status(404).json({ message: 'Project manager not found' });
      return;
    }

    // Calculate additional metrics
    const managedProjects = await Project.find({ projectManager: id });
    const activeProjects = managedProjects.filter(p => p.status === 'Active').length;
    const completedProjects = managedProjects.filter(p => p.status === 'Completed' || p.status === 'Delivered').length;
    const onTrackProjects = managedProjects.filter(p => {
      const deadline = new Date(p.deadline);
      const now = new Date();
      const daysRemaining = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 3600 * 24));
      return daysRemaining > 0 && (p.progressPercent || 0) >= (100 - (daysRemaining * 5));
    }).length;

    const metrics = {
      ...projectManager.toObject(),
      projectCounts: {
        total: managedProjects.length,
        active: activeProjects,
        completed: completedProjects,
        onTrack: onTrackProjects
      }
    };

    res.status(200).json(metrics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project manager metrics', error });
  }
}; 