import CreateQasida from "@/components/poems/create-qasida";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { redirect } from 'next/navigation';

export default async function CreatePoemPage() {
    const session = await auth();

    // Protect the route - redirect if not logged in
    if (!session?.user) {
        redirect('/auth/signin?callbackUrl=/poems/create');
    }

    return (
        <div className="max-w-4xl mx-auto">
             <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-3xl font-serif text-primary">إضافة قصيدة جديدة</CardTitle>
                    <CardDescription>أدخل تفاصيل القصيدة وأبياتها هنا.</CardDescription>
                </CardHeader>
                <CardContent>
                    <CreateQasida />
                </CardContent>
             </Card>
        </div>
    );
}
