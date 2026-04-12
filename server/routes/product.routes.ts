// src/server/routes/productRoutes.ts
import { Router, Request, Response } from 'express';
import ProductModel, { IProduct } from '../models/Product';

function productRoutes(productModel: typeof ProductModel) {
  const router = Router();

  // Get all products with filters, search, pagination, sorting
  router.get('/', async (req: Request, res: Response) => {
    try {
      const {
        category,
        q: search,
        sort = 'createdAt',
        order = 'desc',
        page = '1',
        limit = '12',
        featured,
        minPrice,
        maxPrice,
        minRating,
        tags
      } = req.query;

      const query: any = {};

      // Category filter
      if (category) query.category = category;
      // Featured filter
      if (featured === 'true') query.featured = true;
      // Tags filter (any match)
      if (tags) query.tags = { $in: (tags as string).split(',') };
      // Price range - now works with numbers directly
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice as string);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice as string);
      }
      // Rating filter
      if (minRating) query.rating = { $gte: Number(minRating) };

      // Search across name, description, tags
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [(search as string).toLowerCase()] } }
        ];
      }

      const pageNum = Math.max(1, parseInt(page as string));
      const limitNum = Math.max(1, Math.min(100, parseInt(limit as string)));
      const skip = (pageNum - 1) * limitNum;

      // Sorting
      const sortObj: any = {};
      sortObj[sort as string] = order === 'desc' ? -1 : 1;

      const [products, total] = await Promise.all([
        ProductModel.find(query)
          .sort(sortObj)
          .limit(limitNum)
          .skip(skip)
          .lean(),
        ProductModel.countDocuments(query)
      ]);

      // No conversion needed - price is already a number
      res.json({
        products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
          hasNext: pageNum * limitNum < total,
          hasPrev: pageNum > 1
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error fetching products' });
    }
  });


// Get all unique brands
router.get('/brands', async (req: Request, res: Response) => {
  try {
    const brands = await ProductModel.distinct('brand');
    const validBrands = brands.filter(brand => brand && brand !== '');
    res.json(validBrands);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching brands' });
  }
});
  // Get single product by slug
  router.get('/:slug', async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const product = await ProductModel.findOne({ slug }).lean();
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      // Price is already a number
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching product' });
    }
  });

  // Create product
  router.post('/', async (req: Request, res: Response) => {
    try {
      const productData = { ...req.body };
      
      // Ensure price is a number
      if (productData.price) {
        productData.price = typeof productData.price === 'string' 
          ? parseFloat(productData.price) 
          : Number(productData.price);
      }
      
      const product = new ProductModel(productData);
      const savedProduct = await product.save();
      res.status(201).json(savedProduct);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error creating product' });
    }
  });

  // Update product
  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      
      // Ensure price is a number if it exists in the update
      if (updateData.price !== undefined) {
        updateData.price = typeof updateData.price === 'string' 
          ? parseFloat(updateData.price) 
          : Number(updateData.price);
      }
      
      const product = await ProductModel.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true, runValidators: true }
      );
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error updating product' });
    }
  });

  // Delete product
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const product = await ProductModel.findByIdAndDelete(id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting product' });
    }
  });

  return router;
}

export default productRoutes;