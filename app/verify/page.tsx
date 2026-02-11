import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import CertificateView from "./certificate-view"

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function VerifyPage({ searchParams }: Props) {
    const { id, email } = await searchParams;

    // 1. Validation: Ensure at least one valid search parameter exists
    if ((!id || typeof id !== 'string') && (!email || typeof email !== 'string')) {
        return <div className="p-12 text-center text-red-500">Please provide a valid ID or Email</div>
    }

    // 2. Query logic: findFirst allows us to search by non-unique fields like participant email
    const certificate = await prisma.certificate.findFirst({
        where: {
            OR: [
                { id: typeof id === 'string' ? id : undefined },
                { 
                    participant: { 
                        email: typeof email === 'string' ? email : undefined 
                    } 
                }
            ]
        },
        include: {
            participant: { include: { event: true } },
            template: { include: { event: true } }
        }
    })

    if (!certificate) {
        return notFound()
    }

    const { participant, template } = certificate
    const placeholders = template.placeholders ? (JSON.parse(template.placeholders as string) as any[]) : [];
    const event = participant?.event || template.event;

    return (
        <CertificateView
            certificate={certificate}
            participant={participant}
            template={template}
            event={event}
            placeholders={placeholders}
        />
    )
}
