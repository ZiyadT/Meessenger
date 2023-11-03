'use client'

import Modal from "@/app/components/Modal"
import Image from "next/image"

interface Props {
    src?: string | null
    isOpen?: boolean
    onClose: () => void
}

const ImageModal: React.FC<Props> = ({
    src,
    isOpen,
    onClose
}) => {
    if (!src){
        return null
    }

    return ( 
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="h-96 w-96">
                <Image alt="image" className="object-cover" fill src={src} />
            </div>
        </Modal>
     );
}
 
export default ImageModal;