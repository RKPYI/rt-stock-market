'use server';

import { connectToDatabase } from '@/database/mongoose';
import Watchlist from '@/database/models/watchlist.model';

export const getWatchlistSymbolsByEmail = async (email: string): Promise<string[]> => {
  try {
    if (!email) return [];

    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) return [];

    // Better Auth stores users in the 'user' collection (see other actions)
    const user = await db.collection('user').findOne({ email }, { projection: { id: 1, _id: 1 } });
    if (!user) return [];

    const userId = (user.id as string) || user._id?.toString();
    if (!userId) return [];

    const docs = await Watchlist.find({ userId }).select('symbol -_id').lean();
    if (!docs || docs.length === 0) return [];

    return docs.map((d) => d.symbol as string);
  } catch (e) {
    console.error('Error fetching watchlist symbols by email:', e);
    return [];
  }
};
