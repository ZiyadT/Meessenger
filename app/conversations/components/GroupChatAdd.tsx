'use client'

import Button from "@/app/components/Button"
import Input from "@/app/components/Input"
import Modal from "@/app/components/Modal"
import Select from "@/app/components/Select"
import { User } from "@prisma/client"
import axios from "axios"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { FieldValues, SubmitHandler, useForm } from "react-hook-form"
import toast from "react-hot-toast"

interface Props {
    isOpen?: boolean
    onClose: () => void
    users: User[]
}

const GroupChatAdd: React.FC<Props> = ({
    isOpen,
    onClose,
    users
}) => {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: {
            errors
        }
    } = useForm<FieldValues>({
        defaultValues: {
            name: '',
            members: []
        }
    })
    const members = watch('members')
    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        setLoading(true)

        axios.post('/api/conversations', {...data, isGroup: true}).then(
            () => {
                router.refresh()
                onClose()
            }
        ).catch(
            () => toast.error('Something went wrong')
        ).finally(
            () => setLoading(false)
        )
    }
    return ( 
        <Modal isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-12">
                    <div className="border-b border-gray-900/10 pb-12">
                        <h2 className="text-basefont-semibold leading-7 text-gray-900">
                            Create a group chat
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-gray-600">
                            Create a chat with multiple people
                        </p>
                        <div className="mt-10 flex flex-col gap-y-8">
                            <Input register={register} label="Name" id="name" disabled={loading} required errors={errors} />
                            <Select disabled={loading} label="Members" value={members}
                                options={users.map((user) => ({
                                    value: user.id,
                                    label: user.name
                                }))}
                                onChange={(value) => setValue('members', value, {
                                    shouldValidate: true
                                })}
                            />
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex items-center justify-end gap-6">
                        <Button disabled={loading} onClick={onClose} type="button" secondary>
                            Cancel
                        </Button>
                        <Button disabled={loading} type="submit">
                            Create
                        </Button>
                </div>
            </form>
        </Modal>
     );
}
 
export default GroupChatAdd;