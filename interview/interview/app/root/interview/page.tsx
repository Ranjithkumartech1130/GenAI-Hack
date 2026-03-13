import { getCurrentUser } from "@/lib/actions/auth.action";
import InterviewForm from "@/components/InterviewForm";
import { redirect } from "next/navigation";

const InterviewPage = async () => {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/auth/sign-in");
    }

    return (
        <div className="flex flex-col gap-10 items-center w-full">
            <div className="flex flex-col gap-4 text-center max-w-2xl">
                <h1 className="text-4xl font-bold text-white">Ready to Ace Your Next Interview?</h1>
                <p className="text-xl text-light-100">
                    Tailor your practice session by providing the job details below.
                    Our AI will simulate a real-world interview experience for you.
                </p>
            </div>

            <InterviewForm userId={user.id} />
        </div>
    );
};

export default InterviewPage;
