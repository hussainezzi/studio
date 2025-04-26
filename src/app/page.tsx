import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6">
      <h1 className="text-4xl font-bold text-primary font-serif">
        أهلاً بك في ديوان العرب
      </h1>
      <p className="text-lg text-foreground/80 max-w-2xl">
        منصة متكاملة لعشاق الشعر العربي الأصيل. هنا يمكنك تسجيل قصائدك المفضلة، مشاركتها مع الآخرين، واكتشاف روائع الشعر العربي عبر العصور. انضم إلينا وساهم في إثراء هذا الصرح الأدبي.
      </p>
      <div className="flex gap-4">
        <Link href="/poems">
          <Button size="lg" variant="secondary">
            تصفح القصائد
          </Button>
        </Link>
        {!session?.user && (
           <Link href="/auth/signup">
             <Button size="lg">
               انضم الآن
             </Button>
           </Link>
        )}
         {session?.user && (
           <Link href="/poems/create">
             <Button size="lg">
               أضف قصيدة
             </Button>
           </Link>
        )}
      </div>
      {/* Optional: Add a section for featured poems later */}
       {/* <section className="mt-12 w-full max-w-4xl">
         <h2 className="text-2xl font-semibold mb-4 border-b-2 border-primary pb-2">قصائد مميزة</h2>
         {/* Placeholder for featured poems list */}
         {/* <p className="text-muted-foreground">سيتم عرض القصائد المميزة هنا قريباً.</p> */}
       {/* </section> */}
    </div>
  );
}
