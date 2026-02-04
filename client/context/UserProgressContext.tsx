import React, { createContext, useContext, useState, useEffect } from "react";

interface LessonStats {
    completed: boolean;
    timeSpent: number;
    score?: number;
    lastAccessed: string;
}

interface UserProgress {
    lessons: Record<string, LessonStats>;
    lastLessonId: string | null;
    totalTime: number;
    streak: number;
    lastStreakUpdate: string | null;
}

interface UserProgressContextType {
    progress: UserProgress;
    markComplete: (lessonId: string, score?: number) => void;
    updateTimeSpent: (lessonId: string, minutes: number) => void;
    setLastActive: (lessonId: string) => void;
    getLessonProgress: (lessonId: string) => LessonStats | undefined;
}

const UserProgressContext = createContext<UserProgressContextType | undefined>(undefined);

const STORAGE_KEY = "quantara_user_progress";

const initialProgress: UserProgress = {
    lessons: {},
    lastLessonId: null,
    totalTime: 0,
    streak: 0,
    lastStreakUpdate: null,
};

export const UserProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [progress, setProgress] = useState<UserProgress>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : initialProgress;
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }, [progress]);

    // Daily Streak Logic
    useEffect(() => {
        const checkStreak = () => {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

            setProgress(prev => {
                let lastUpdateValue = prev.lastStreakUpdate;
                if (!lastUpdateValue) {
                    // First time user
                    return {
                        ...prev,
                        streak: 1,
                        lastStreakUpdate: new Date(today).toISOString()
                    };
                }

                const lastDateObj = new Date(lastUpdateValue);
                const lastUpdate = new Date(lastDateObj.getFullYear(), lastDateObj.getMonth(), lastDateObj.getDate()).getTime();

                const msInDay = 24 * 60 * 60 * 1000;
                const diff = today - lastUpdate;

                if (diff === msInDay) {
                    // Consecutive day
                    return {
                        ...prev,
                        streak: prev.streak + 1,
                        lastStreakUpdate: new Date(today).toISOString()
                    };
                } else if (diff > msInDay) {
                    // Streak broken
                    return {
                        ...prev,
                        streak: 1,
                        lastStreakUpdate: new Date(today).toISOString()
                    };
                }

                // Same day, no change
                return prev;
            });
        };

        checkStreak();
    }, []);

    const markComplete = (lessonId: string, score?: number) => {
        setProgress((prev) => {
            const stats = prev.lessons[lessonId] || { completed: false, timeSpent: 0, lastAccessed: new Date().toISOString() };
            return {
                ...prev,
                lessons: {
                    ...prev.lessons,
                    [lessonId]: {
                        ...stats,
                        completed: true,
                        score: score ?? stats.score,
                        lastAccessed: new Date().toISOString(),
                    },
                },
            };
        });
    };

    const updateTimeSpent = (lessonId: string, minutes: number) => {
        setProgress((prev) => {
            const stats = prev.lessons[lessonId] || { completed: false, timeSpent: 0, lastAccessed: new Date().toISOString() };
            return {
                ...prev,
                totalTime: prev.totalTime + minutes,
                lessons: {
                    ...prev.lessons,
                    [lessonId]: {
                        ...stats,
                        timeSpent: stats.timeSpent + minutes,
                        lastAccessed: new Date().toISOString(),
                    },
                },
            };
        });
    };

    const setLastActive = (lessonId: string) => {
        setProgress((prev) => ({
            ...prev,
            lastLessonId: lessonId,
            lessons: {
                ...prev.lessons,
                [lessonId]: {
                    ...(prev.lessons[lessonId] || { completed: false, timeSpent: 0 }),
                    lastAccessed: new Date().toISOString(),
                },
            },
        }));
    };

    const getLessonProgress = (lessonId: string) => progress.lessons[lessonId];

    return (
        <UserProgressContext.Provider
            value={{ progress, markComplete, updateTimeSpent, setLastActive, getLessonProgress }}
        >
            {children}
        </UserProgressContext.Provider>
    );
};

export const useUserProgress = () => {
    const context = useContext(UserProgressContext);
    if (context === undefined) {
        throw new Error("useUserProgress must be used within a UserProgressProvider");
    }
    return context;
};
