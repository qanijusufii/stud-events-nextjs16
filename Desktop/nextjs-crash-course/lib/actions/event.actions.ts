'use server';
import Event from "@/database/event.model"

import connectDB from "@/lib/mongodb";

type LeanEvent = {
    _id: any;
    title: string;
    slug: string;
    description: string;
    overview: string;
    image: string;
    venue: string;
    location: string;
    date: string;
    time: string;
    mode: string;
    audience: string;
    agenda: string[];
    organizer: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
};

export const getEventBySlug = async (slug: string): Promise<LeanEvent | null> => {
    try {
        await connectDB();
        const event = await Event.findOne({ slug: slug.trim().toLowerCase() }).lean();
        return event as unknown as LeanEvent | null;
    } catch {
        return null;
    }
}

export const getSimilarEventsBySlug = async (slug: string): Promise<LeanEvent[]> => {
    try{
        await connectDB();

        const event = await Event.findOne({ slug });
        if (!event) {
            return [];
        }
        const similarEvents = await Event.find({_id:{ $ne: event._id}, tags:{ $in: event.tags }}).lean();
        return similarEvents as unknown as LeanEvent[];

    }catch {
        return [];
    }
}