import { UserRole } from '@prisma/client';
import { prisma } from '../config/prisma'
import { UserUpdateDto } from "../types/userTypes";
import { ValidationError } from "../utils/errors";
import bcrypt from 'bcrypt';

export class UserService {

    // ------- User functionalities --------
    // 01 - Get user profile
    static async getUserProfile(userId:number){

        // Check if user exists
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) { throw new ValidationError('User not found'); }
        
        // Remove password from user object
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    // 02 - Update user profile
    static async updateUserProfile(userId:number, data: UserUpdateDto){
        
        // Check if user exists
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) { throw new ValidationError('User not found'); }

        // Update user data
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: data
        });

        // Remove password from user object
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    // 03 - Update user password
    static async updateUserPassword(userId:number, currentPassword:string, newPassword:string){

        // Check if user exists
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) { throw new ValidationError('User not found'); }

        // Verify current password after hashing
        const passwordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatch) { throw new ValidationError('Current passeword is incorrect'); }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user password
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        return {success: true};
    }

    // ------- Admin funcitonalities --------
    // 04 - Get all users
    static async getAllUsers()
    {
        const users = await prisma.user.findMany();
        if(!users){throw new ValidationError("Users not found")}

        return users;
    }

    //05 - Get user by Id
    static async getUserById(userId:number){
        // Check if user exists
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) { throw new ValidationError('User not found'); }
        
        return user;
    }

    //06 - UpdateUserRole
    static async updateUserRole(userId:number, currentRole: UserRole, newRole:UserRole){
        // Check if user exists
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) { throw new ValidationError('User not found'); }
        //check if new role is current role 
        if (newRole == currentRole){throw new ValidationError('new role must be different to current role')}

        // Update user data
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { role: newRole }
        });

        // Remove password from user object
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    //07 - Delete user
    static async deleteUser(userId:number){

        const deletedUser = await prisma.user.delete({
            where:{id: userId}
        });

        if(!deletedUser){throw new ValidationError('User not found')};  
        
        return deletedUser; 
    }




}