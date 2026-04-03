// server/config/gridfs.ts
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

let gridFSBucket: GridFSBucket | null = null;

export const initGridFS = () => {
  if (!mongoose.connection.db) {
    throw new Error('Database connection not established');
  }
  
  gridFSBucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: 'uploads'
  });
  
  return gridFSBucket;
};

export const getGridFSBucket = () => {
  if (!gridFSBucket) {
    return initGridFS();
  }
  return gridFSBucket;
};