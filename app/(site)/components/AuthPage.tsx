'use client';
import { useCallback, useEffect, useState } from "react";
import { FieldValues, SubmitHandler, set, useForm } from "react-hook-form";
import Input from "@/app/components/Input";
import Button from "@/app/components/Button";
import AuthSocialButton from "./AuthSocialButton";
import {BsGithub, BsGoogle} from 'react-icons/bs'
import axios from "axios";
import {toast} from "react-hot-toast"
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Variant = 'LOGIN' | 'REGISTER'

const AuthPage = () => {
    const session = useSession()
    const router = useRouter()
    const [variant, setVariant] = useState<Variant>('LOGIN');
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (session?.status === 'authenticated'){
            router.push('/users')
        }
    }, [session?.status])

    const toggleVariant = useCallback(() => {
        if (variant === "LOGIN"){
            setVariant("REGISTER")
        }
        else{
            setVariant("LOGIN")
        }
    }, [variant])

    const {
        register,
        handleSubmit,
        formState: {
            errors
        }
    } = useForm<FieldValues>({
        defaultValues: {
            name: '',
            email: '',
            password: ''
        }
    })

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        setLoading(true)
        
        if (variant === 'REGISTER'){
            axios.post('/api/register', data).then(
                () => signIn('credentials', data)
            ).catch(
                () => toast.error('Something went wrong')
            ).finally(
                () => setLoading(false)
            )
        }
        
        if (variant === 'LOGIN'){
            signIn('credentials', {...data, redirect: false}).then(
                (callback) => {
                    if (callback?.error){
                        toast.error('Invalid credentials')
                    }
                    else if (callback?.ok){
                        toast.success('Logged in')
                    }
                }
            ).finally(() => setLoading(false))
        }
    }

    const socialAction = (action: string) => {
        setLoading(true)
        signIn(action, {redirect: false}).then(
            (callback) => {
                if (callback?.error){
                    toast.error('Invalid credentials')
                }
                else if (callback?.ok){
                    toast.success('Logged in')
                }
            }
        ).finally(() => setLoading(false))
    }

    return (
        <div className = "mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className = "bg-white px-4 py-8 shadow sm-rounded-lg sm:px-10">
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    {variant === 'REGISTER' && (
                        <Input label="Name" id="name" register={register} errors={errors} disabled={loading}></Input>
                    )}
                    <Input label="Email" id="email" type="email" register={register} errors={errors} disabled={loading}></Input>
                    <Input label="Password" id="password" type="password" register={register} errors={errors} disabled={loading}></Input>
                    <div>
                        <Button disabled={loading} fullWidth type="submit">{variant === 'LOGIN' ? "Sign in" : "Register"}</Button>
                    </div>
                </form>
                <div className="mt-3 text-center">
                    <p className="mx-auto text-sm text-gray-500">Or continue with</p>
                </div>
                <div className="mt-3 flex gap-2">
                    <AuthSocialButton icon={BsGithub} onClick={() => socialAction('github')}></AuthSocialButton>
                    <AuthSocialButton icon={BsGoogle} onClick={() => socialAction('google')}></AuthSocialButton>
                </div>
                <div className="mt-3 flex justify-center gap-2 text-sm px-2">
                    <div>{variant === "LOGIN" ? "Need an account?" : "Have an account?"}</div>
                    <div onClick={toggleVariant} className="underline cursor-pointer">{variant === "LOGIN" ? "Sign up" : "Log in"}</div>
                </div>
            </div>
        </div> 
    )
}

export default AuthPage