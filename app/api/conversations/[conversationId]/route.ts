import getCurrentUser from "@/app/actions/getCurrentUser"
import { NextResponse } from "next/server"
import prisma from '@/app/libs/prismadb'
import { pusherServer } from "@/app/libs/pusher"

interface IParams {
    conversationId?: string
}

export async function DELETE(
    request: Request,
    {params}: {params: IParams}
) {
    try {
        const {conversationId} = params
        const currentUser = await getCurrentUser()

        if (!currentUser?.id){
            return new NextResponse('Unauthorized', {status: 401})
        }

        const existingConvo = await prisma.conversation.findUnique({
            where: {
                id: conversationId
            },
            include: {
                users: true
            }
        })

        if (!existingConvo){
            return new NextResponse('Invalid ID', {status: 400})
        }

        const deletedConvo = await prisma.conversation.deleteMany({
            where: {
                id: conversationId,
                userIds: {
                    hasSome: [currentUser.id]
                }
            }
        })

        existingConvo.users.forEach((user) => {
            if(user.email) {
                pusherServer.trigger(user.email, 'conversation:remove', existingConvo)
            }
        })

        return NextResponse.json(deletedConvo)
    }catch(error:any) {
        return new NextResponse('Server Error', {status:500})
    }
}