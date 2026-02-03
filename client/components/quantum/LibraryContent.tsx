import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, ExternalLink } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const books = [
    {
        title: "Quantum Computation and Quantum Information",
        author: "Michael Nielsen & Isaac Chuang",
        desc: "The comprehensive 'bible' of quantum computing.",
        link: "https://www.cambridge.org/highereducation/books/quantum-computation-and-quantum-information/01E101966A340F2AFACDE417A987036A",
    },
    {
        title: "Quantum Computing: An Applied Approach",
        author: "Jack D. Hidary",
        desc: "A hands-on guide for software engineers and scientists.",
        link: "https://link.springer.com/book/10.1007/978-3-030-23922-0",
    },
    {
        title: "Quantum Computing for Everyone",
        author: "Chris Bernhardt",
        desc: "A concise introduction to quantum basics without heavy math.",
        link: "https://mitpress.mit.edu/9780262539531/quantum-computing-for-everyone/",
    },
    {
        title: "Programming Quantum Computers",
        author: "Eric Johnston, Nic Harrigan, Mercedes Gimeno-Segovia",
        desc: "Practical skills for writing quantum programs.",
        link: "https://www.oreilly.com/library/view/programming-quantum-computers/9781492039679/",
    },
    {
        title: "Quantum Theory: A Very Short Introduction",
        author: "John Polkinghorne",
        desc: "Clear and accessible overview of quantum theory.",
        link: "https://academic.oup.com/book/561",
    }
];

export function LibraryContent() {
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">{t("library.title")}</h2>
                    <p className="text-gray-400">{t("library.desc")}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {books.map((book, index) => (
                    <Card key={index} className="bg-black/20 border-white/10 hover:border-cyan-500/50 transition-all duration-300">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="p-2 bg-cyan-500/10 rounded-lg">
                                    <Book className="h-6 w-6 text-cyan-400" />
                                </div>
                            </div>
                            <CardTitle className="text-white mt-4 line-clamp-2 leading-tight">
                                {book.title}
                            </CardTitle>
                            <CardDescription className="text-cyan-400/80 mt-1">
                                {book.author}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-400 text-sm mb-6 line-clamp-3">
                                {book.desc}
                            </p>
                            <Button asChild className="w-full bg-white/5 hover:bg-white/10 text-white border-white/10">
                                <a href={book.link} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    {t("library.viewBook")}
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
