import axiosInstance from "../configs/axios";

type LoginData = {
    email: string;
    password: string;
};

const login = async (data: LoginData) => {
    try {
        const response = await axiosInstance.post('auth/login', data);
        return response;

    } catch (error) {
        console.log(error);
        return false;
    }

};

export {login};
