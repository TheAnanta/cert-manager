import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import CertificateView from "./certificate-view"

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function VerifyPage({ searchParams }: Props) {
    const { id } = await searchParams;
    if (!id || typeof id !== 'string') {
        return <div className="p-12 text-center text-red-500">Invalid ID</div>
    }

    const certificate = await prisma.certificate.findUnique({
        where: { id },
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
