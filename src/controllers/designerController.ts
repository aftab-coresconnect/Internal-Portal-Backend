import { Request, Response } from 'express';
import Designer from '../models/Designer';
import Project from '../models/Project';
import mongoose from 'mongoose';

// Get all designers
export const getAllDesigners = async (req: Request, res: Response): Promise<void> => {
  try {
    const designers = await Designer.find()
      .select('-password');
    res.status(200).json(designers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching designers', error });
  }
};

// Get designer by ID
export const getDesignerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const designer = await Designer.findById(req.params.id)
      .select('-password');
    
    if (!designer) {
      res.status(404).json({ message: 'Designer not found' });
      return;
    }
    
    res.status(200).json(designer);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching designer', error });
  }
};

// Update designer profile
export const updateDesignerProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      toolsUsed,
      figmaProfile,
      designPortfolio
    } = req.body;

    const updatedDesigner = await Designer.findByIdAndUpdate(
      id,
      {
        $set: {
          toolsUsed,
          figmaProfile,
          designPortfolio
        }
      },
      { new: true, runValidators: true }
    )
    .select('-password');

    if (!updatedDesigner) {
      res.status(404).json({ message: 'Designer not found' });
      return;
    }

    res.status(200).json(updatedDesigner);
  } catch (error) {
    res.status(500).json({ message: 'Error updating designer profile', error });
  }
};

// Update designer metrics
export const updateDesignerMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      clientApprovalRate,
      completedDesigns,
      designRevisions
    } = req.body;

    const updatedDesigner = await Designer.findByIdAndUpdate(
      id,
      {
        $set: {
          clientApprovalRate,
          completedDesigns,
          designRevisions
        }
      },
      { new: true, runValidators: true }
    )
    .select('-password');

    if (!updatedDesigner) {
      res.status(404).json({ message: 'Designer not found' });
      return;
    }

    res.status(200).json(updatedDesigner);
  } catch (error) {
    res.status(500).json({ message: 'Error updating designer metrics', error });
  }
};

// Get designer's performance metrics
export const getDesignerMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const designer = await Designer.findById(id)
      .select('clientApprovalRate completedDesigns designRevisions');

    if (!designer) {
      res.status(404).json({ message: 'Designer not found' });
      return;
    }

    // Get projects where designer is involved
    const projects = await Project.find({
      'designers': id
    }).select('title status figmaLink');

    const metrics = {
      ...designer.toObject(),
      projectStats: {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'Active').length,
        completedProjects: projects.filter(p => p.status === 'Completed' || p.status === 'Delivered').length
      },
      recentProjects: projects.slice(0, 5) // Get 5 most recent projects
    };

    res.status(200).json(metrics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching designer metrics', error });
  }
}; 