import { View } from "@/components/Themed";
import { useEffect, useState } from "react";
import { Image, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Form, Input, Spinner } from "tamagui";
import * as z from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod'
import { router } from "expo-router";
import { supabase } from "@/utils/supabase";


const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});
type LoginInfo = z.infer<typeof LoginSchema>;

export default function Login() {
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState<'off' | 'submitting' | 'submitted'>('off');

    const loginForm = useForm<LoginInfo>({
        resolver: zodResolver(LoginSchema)
    });

    async function handleLogin(data: LoginInfo) {
        console.log('Login:', data)

        setStatus('submitting');
        const { error } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password
        });
        setStatus('off');

        if (error) {
            console.log('Login error:', error);
            return;
        }
        router.push('/(tabs)');
    }

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) router.push('/(tabs)');
        })
        setIsLoading(false);
    }, []);

    return (
        <View className='bg-[#faf6ff]'>
            <SafeAreaView className='flex flex-col items-center justify-center h-full bg-transparent'>
                {isLoading ? (
                    <Image className='w-full' source={require('@/assets/images/tecnu-logo.png')} />
                ): (
                    <Form
                        onSubmit={loginForm.handleSubmit((data) => handleLogin(data))}
                        className='flex flex-col gap-4 w-full p-4 items-stretch'
                    >
                        <View className='w-full flex flex-row justify-center bg-transparent'>
                            <Image source={require('@/assets/images/tecnu-logo.png')} />
                        </View>
                        
                        <View className='bg-transparent'>
                            <Input
                                placeholder='Correo'
                                autoCapitalize='none'
                                autoCorrect={false}
                                {...loginForm.register('email')}
                                onChangeText={(text) => loginForm.setValue('email', text)}
                            />
                            {loginForm.formState.errors.email?.message && <Text className='bg-transparent text-xs text-red-500'>{loginForm.formState.errors.email.message}</Text>}
                        </View>
                        <View className='bg-transparent'>
                            <Input
                                placeholder='Contraseña'
                                secureTextEntry={true}
                                autoCapitalize='none'
                                autoCorrect={false}
                                {...loginForm.register('password')}
                                onChangeText={(text) => loginForm.setValue('password', text)}
                            />
                            {loginForm.formState.errors.password?.message && <Text className='bg-transparent text-xs text-red-500'>{loginForm.formState.errors.password.message}</Text>}
                        </View>
                        
                        <Form.Trigger asChild disabled={status !== 'off'}>
                            <Button icon={status === 'submitting' ? <Spinner/> : undefined} theme="blue">
                                Iniciar Sesión
                            </Button>
                        </Form.Trigger>
                    </Form>
                )}
            </SafeAreaView>
        </View>
    )
}
