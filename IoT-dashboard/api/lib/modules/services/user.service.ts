import UserModel from '../schemas/user.schema';
import { IUser } from "../models/user.model";

class UserService {
    public async createNewOrUpdate(user: IUser) {
        try {
            if (!user._id) {
                const dataModel = new UserModel(user);
                return await dataModel.save();
            } else {
                return await UserModel.findByIdAndUpdate(user._id, { $set: user }, { new: true });
            }
        } catch (error) {
            console.error('Wystąpił błąd podczas tworzenia danych:', error);
            throw new Error('Wystąpił błąd podczas tworzenia danych');
        }
    }

    public async getByEmailOrName(name: string) {
        try {
            const result = await UserModel.findOne({ $or: [{ email: name }, { login: name }] });
            return result;
        } catch (error) {
            console.error('Wystąpił błąd podczas pobierania danych:', error);
            throw new Error('Wystąpił błąd podczas pobierania danych');
        }
    }

    public async getAll() {
        try {
            const result = await UserModel.find({}).select('-password');
            return result;
        } catch (error) {
            console.error('Wystąpił błąd podczas pobierania użytkowników:', error);
            throw new Error('Wystąpił błąd podczas pobierania użytkowników');
        }
    }

    public async getById(id: string) {
        try {
            const result = await UserModel.findById(id).select('-password');
            return result;
        } catch (error) {
            console.error('Wystąpił błąd podczas pobierania użytkownika:', error);
            throw new Error('Wystąpił błąd podczas pobierania użytkownika');
        }
    }

    public async deleteById(id: string) {
        try {
            const result = await UserModel.findByIdAndDelete(id);
            return result;
        } catch (error) {
            console.error('Wystąpił błąd podczas usuwania użytkownika:', error);
            throw new Error('Wystąpił błąd podczas usuwania użytkownika');
        }
    }
}

export default UserService;
