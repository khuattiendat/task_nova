import {useForm, SubmitHandler} from "react-hook-form"
import {useNavigate} from "react-router-dom";
import {login} from "../services/AuthService";
import {toast} from "react-toastify";
import CookieService from "../services/CookieService";
import 'react-toastify/dist/ReactToastify.css';

type Inputs = {
    email: string
    password: string
}
const LoginPage = () => {
    const {
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<Inputs>()
    const navigate = useNavigate()
    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        try {
            const response = await login(data);

            if (response) {
                const {access_token, users_list, user_id} = response;
                CookieService.set('access_token', access_token, '/');
                CookieService.set('user_id', user_id, '/');
                toast.success("Đăng nhập thành công");
                navigate('/user', {state: {users_list}});
            } else {
                toast.error("Tài khoản không đúng");
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra trong quá trình đăng nhập");
            console.error('Login error:', error);
        }
    };


    return (
        <section className="bg-gray-50 dark:bg-gray-900">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
                    <img className="w-8 h-8 mr-2" src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg"
                         alt="logo"/>
                    Flowbite
                </a>
                <div
                    className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                            Sign in to your account
                        </h1>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6" action="#">
                            <div>
                                <label htmlFor="email"
                                       className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your
                                    email</label>
                                <input {...register("email", {required: true})} type="email" id="email"
                                       className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                       placeholder="name@company.com"/>
                                {errors.email && <span className="text-red-500 text-xs">Bạn phải nhập vào email</span>}
                            </div>

                            <div>
                                <label htmlFor="password"
                                       className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                                <input {...register("password", {required: true})} type="password" id="password"
                                       placeholder="••••••••"
                                       className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
                                {errors.password &&
                                    <span className="text-red-500 text-xs">Bạn phải nhập vào password</span>}
                            </div>
                            <button type="submit"
                                    className="w-full  text-white bg-sky-500 hover:bg-sky-600 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Sign
                                in
                            </button>
                            <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                                Don’t have an account yet? <a href="#"
                                                              className="font-medium text-primary-600 hover:underline dark:text-primary-500">Sign
                                up</a>
                            </p>
                        </form>
                    </div>
                </div>

            </div>
        </section>
    )
}

export default LoginPage
