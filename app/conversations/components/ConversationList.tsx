'use client'

import { FullConversationType } from "@/app/types";
import { useEffect, useMemo, useState } from "react";
import {useRouter} from 'next/navigation'
import useConversation from "@/app/hooks/useConversation";
import clsx from "clsx";
import {MdOutlineGroupAdd} from 'react-icons/md'
import ConversationBox from "./ConversationBox";
import GroupChatAdd from "./GroupChatAdd";
import { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { pusherClient } from "@/app/libs/pusher";
import { find } from "lodash";

interface Props {
    initialItems: FullConversationType[]
    users: User[]
}

const ConversationList: React.FC<Props> = ({
    initialItems,
    users
}) => {
    const session = useSession()
    const [items, setItems] = useState(initialItems)
    const router = useRouter()
    const {conversationId, isOpen} = useConversation()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const pusherKey = useMemo(() => {
        return session.data?.user?.email
    }, [session.data?.user?.email])

    useEffect(() => {
        if (!pusherKey){
            return
        }

        const newHandler = (conversation: FullConversationType) => {
            console.log('New handler')
            setItems((current) => {
                if (find(current, {id: conversation.id})) {
                    return current
                }

                return [conversation, ...current]
            })
        }

        const updateHandler = (conversation: FullConversationType) => {
            console.log('update handler')
            setItems((current) => current.map((currentConversation) => {
                if (currentConversation.id === conversation.id) {
                    return {
                        ...conversation,
                        messages: conversation.messages
                    }
                }

                return currentConversation
            }))
        }

        const removeHandler = (conversation: FullConversationType) => {
            setItems((current) => {
                return [...current.filter((convo) => convo.id !== conversation.id)]
            })

            if (conversationId === conversation.id) {
                router.push('/conversations')
            }
        }


        pusherClient.subscribe(pusherKey)
        pusherClient.bind('conversation:new', newHandler)
        pusherClient.bind('conversation:update', updateHandler)
        pusherClient.bind('conversation:remove', removeHandler)

        return () => {
            pusherClient.unsubscribe(pusherKey)
            pusherClient.unbind('conversation:new', newHandler)
            pusherClient.unbind('conversation:update', updateHandler)
            pusherClient.unbind('conversation:remove', removeHandler)
        }
    }, [pusherKey, conversationId, router])
    return ( 
        <>
            <GroupChatAdd isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} users={users} />
            <aside className={clsx(`
                fixed 
                inset-y-0 
                pb-20 
                lg:pb-0 
                lg:left-20 
                lg:w-80 
                lg:block 
                overflow-y-auto
                border-r
                border-gray-200
                `,
                isOpen ? 'hidden' : 'block w-full left-0'
            )}>
                <div className="px-5">
                    <div className="flex justify-between mb-4 pt-4">
                        <div className="text-2xl font-bold text-neutral-800">
                            Messages
                        </div>
                        <div className="rounded-full p-2 bg-gray-100 text-gray-600 cursor-pointer hover:opacity-75 transition" 
                            onClick={() => setIsModalOpen(true)}>
                            <MdOutlineGroupAdd size={20} />
                        </div>
                    </div>
                    {items.map((item) => (
                        <ConversationBox key={item.id} data={item} selected={conversationId === item.id} />
                    ))}
                </div>
            </aside>
        </>
     );
}
 
export default ConversationList;