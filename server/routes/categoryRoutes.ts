// src/server/routes/categoryRoutes.ts
import { Router, Request, Response } from 'express';
import ProductModel from '../models/Product';

function categoryRoutes() {
  const router = Router();

  // Get all categories with product counts
  router.get('/', async (req: Request, res: Response) => {
    try {
      // Aggregate to get unique categories and their product counts
      const categories = await ProductModel.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            products: { $push: '$$ROOT' }
          }
        },
        {
          $project: {
            _id: 0,
            name: '$_id',
            slug: '$_id',
            count: 1,
            // Optional: get sample product image
            image: { $arrayElemAt: ['$products.images', 0] }
          }
        },
        {
          $sort: { name: 1 }
        }
      ]);

      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Error fetching categories' });
    }
  });

  // Get single category by slug with products
  router.get('/:slug', async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      
      // Get products in this category
      const products = await ProductModel.find({ category: slug })
        .sort({ createdAt: -1 })
        .lean();
      
      // Get category info
      const categoryInfo = {
        name: slug,
        slug: slug,
        productCount: products.length,
        products: products
      };

      if (products.length === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.json(categoryInfo);
    } catch (error) {
      console.error('Error fetching category:', error);
      res.status(500).json({ error: 'Error fetching category' });
    }
  });

  return router;
}

export default categoryRoutes;