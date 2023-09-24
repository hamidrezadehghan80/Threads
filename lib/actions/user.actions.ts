"use server"

import {connectToDB} from "@/lib/mongoose";
import User from "@/lib/models/user.model"
import {revalidatePath} from "next/cache";
import Thread from "@/lib/models/thread.model";
import { FilterQuery, SortOrder } from "mongoose";
import Community from "@/lib/models/community.model";

interface Params {
    userId : string
    username : string
    name : string
    image : string
    bio : string
    path : string
}

export async function update_user(
    {
        userId,
        username,
        name,
        image,
        bio,
        path,
    } : Params) : Promise<void> {
    await connectToDB();


    try {
        await User.findOneAndUpdate(
            {id : userId},
            {
                username : username.toLowerCase(),
                name,
                bio,
                image,
                onboarded : true,
            },
            {upsert : true}
        );

        if(path === "/profile/edit") {
            revalidatePath(path);
        }
    } catch (e : any) {
        throw new Error(`failed to update or create user : ${e.message}`);
    }
}


export async function fetchUser(userId : string) {
    try {
        await connectToDB();

        return await User.findOne({ id: userId }).populate({
            path: "communities",
            model: Community,
        });
    } catch (error: any) {
        throw new Error(`Failed to fetch user: ${error.message}`);
    }
}

export async function fetchUserThreads(userId : string) {
    try {
        await connectToDB();

        const threads = await User.findOne({ id: userId }).populate({
            path: "threads",
            model: Thread,
            populate: [
                {
                    path: "community",
                    model: Community,
                    select: "name id image _id", // Select the "name" and "_id" fields from the "Community" model
                },
                {
                    path: "children",
                    model: Thread,
                    populate: {
                        path: "author",
                        model: User,
                        select: "name image id", // Select the "name" and "_id" fields from the "User" model
                    },
                },
            ],
        });

        return threads;

    }catch (e : any) {
        throw new Error(`Failed to fetch user threads: ${e.message}`);
    }
}

export async function fetchUsers({
    userId,
    searchStr = "" ,
    pageNumber = 1,
    pageSize= 20,
    sortBy="desc"
} : {
    userId : string;
    searchStr? : string;
    pageNumber? : number;
    pageSize? : number;
    sortBy? : SortOrder;
}) {
    try {
        await connectToDB();

        const skip_count = (pageNumber - 1) * pageSize;

        const regex = new RegExp(searchStr, "i");

        const query: FilterQuery<typeof User> = {
            id: { $ne: userId }, // Exclude the current user from the results.
        };

        if(searchStr.trim() !== ""){
            query.$or = [
                { username: { $regex: regex } },
                { name: { $regex: regex } },
            ];
        }

        const sortOptions = { createdAt: sortBy };

        const usersQuery = User.find(query)
            .sort(sortOptions)
            .skip(skip_count)
            .limit(pageSize);

        const totalUsersCount = await User.countDocuments(query);

        const users = await usersQuery.exec();

        const isNext = totalUsersCount > skip_count + users.length;

        return { users, isNext };

    }catch (e:any) {
        throw new Error(`Failed to fetch users : ${e.message}`);
    }
}

export async function getActivity(userId : string) {
    try {
        await connectToDB();

        const userThreads = await Thread.find({ author : userId});

        const childThreadIds = userThreads.reduce((acc, userThread) => {
            return acc.concat(userThread.children);
        }, []);

        const replies = await Thread.find({
            _id: { $in: childThreadIds },
            author: { $ne : userId }
        }).populate({
            path: "author",
            model : User,
            select: "name image _id"
        })

        return replies;

    }catch (e : any) {
        throw new Error(`Failed to get Activity: ${e.message}`)
    }
}