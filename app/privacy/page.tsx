import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <div className="container max-w-3xl mx-auto py-12 px-4">
            <div className="mb-8">
                <Link href="/">
                    <Button variant="ghost" className="pl-0 hover:pl-0">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                    </Button>
                </Link>
            </div>

            <article className="prose prose-slate lg:prose-lg dark:prose-invert">
                <h1>Privacy Policy</h1>
                <p className="lead">Last Updated: April 3rd, 2026</p>

                <h2>1. Data Collection</h2>
                <p>
                    We value your privacy. When you use ResumeTailor AI, we process:
                </p>
                <ul>
                    <li><strong>Resume Content:</strong> The text extracted from your uploaded resume.</li>
                    <li><strong>Job Descriptions:</strong> Text you paste for analysis.</li>
                    <li><strong>Generated Content:</strong> Tailored resumes created during your session.</li>
                </ul>

                <h2>2. How We Use Your Data</h2>
                <p>
                    Your data is used solely for the purpose of generating your customized resume. We use third-party services for processing:
                </p>
                <ul>
                    <li><strong>OpenRouter/Gemini</strong> (or another configured LLM provider): For AI text analysis and generation.</li>
                    <li><strong>LaTeX.Online:</strong> For compiling your resume into a PDF document.</li>
                </ul>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-900 my-6">
                    <h3 className="mt-0 text-yellow-800 dark:text-yellow-200">No Long-Term Storage</h3>
                    <p className="mb-0 text-yellow-800 dark:text-yellow-200">
                        We do not store your resumes or job descriptions on our servers. All data is processed in-memory or stored locally in your browser (LocalStorage) and remains on your device.
                    </p>
                </div>

                <h2>3. Third-Party Services</h2>
                <p>
                    Please review the privacy policies of our partners:
                </p>
                <ul>
                    <li><a href="https://openrouter.ai/privacy" target="_blank" rel="noreferrer">OpenRouter Privacy</a></li>
                    <li><a href="https://latexonline.cc" target="_blank" rel="noreferrer">LaTeX.Online</a></li>
                </ul>

                <h2>4. Your Rights</h2>
                <p>
                    Since we do not store your data, there is no need to request deletion. You can clear your browser&apos;s local storage at any time to remove saved sessions.
                </p>

                <h2>5. Contact</h2>
                <p>
                    If you have questions, please contact us at sahilbansal.sb24@gmail.com
                </p>
            </article>
        </div>
    );
}
