import React, {useState, useRef, useEffect} from "react";
import {
    Plus,
    Trash2,
    Calendar,
    Target,
    ListTodo,
    ChevronDown,
    AlertTriangle,
    ArrowLeft,
    GripVertical,
    Ruler,
    Grip,
    BarChart3,
    RefreshCw,
} from "lucide-react";
import {Goal, Tactic, MeasurementConfig, Cycle} from "../types";

interface PlanningProps {
    goals: Goal[];
    tactics: Tactic[];
    cycle: Cycle;
    actualWeek: number;
    onAddGoal: (goal: Partial<Goal>) => void;
    onUpdateGoal: (id: string, updates: Partial<Goal>) => void;
    onDeleteGoal: (id: string) => void;
    onAddTactic: (tactic: Partial<Tactic>) => void;
    onUpdateTacticMeta: (id: string, updates: Partial<Tactic>) => void;
    onDeleteTactic: (id: string) => void;
    onReorderGoals: (newGoals: Goal[]) => void;
    onReorderTactics: (newTactics: Tactic[]) => void;
    onUpdateCycleStartDate: (newStartDate: string) => void;
    onSetWeek: (week: number) => void;
    onFinish: () => void;
}

const TypeDropdown: React.FC<{
    value: "daily" | "weekly";
    onChange: (val: "daily" | "weekly") => void;
}> = ({value, onChange}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative min-w-[110px]" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 bg-[var(--background)] border border-[var(--border)] px-3 py-1.5 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all outline-none w-full justify-between ${
                    isOpen
                        ? "rounded-t-lg border-b-[var(--card)]"
                        : "rounded-lg hover:border-[var(--primary)]/50"
                }`}>
                <span className="capitalize">{value}</span>
                <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[var(--primary)]" : ""
                    }`}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 bg-[var(--background)] border border-[var(--border)] border-t-0 rounded-b-lg shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-100">
                    {(["weekly", "daily"] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => {
                                onChange(type);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs font-bold transition-colors ${
                                value === type
                                    ? "text-[var(--primary)] bg-[var(--primary)]/5"
                                    : "text-[var(--text-muted)] hover:bg-white/[0.05] hover:text-[var(--text-main)]"
                            }`}>
                            <span className="capitalize">{type}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// Helper functions for Monday calculations
const snapToMonday = (date: Date): Date => {
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(date);
    monday.setDate(date.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
};

const getMondays = (): Date[] => {
    const today = new Date();
    const currentMonday = snapToMonday(today);
    const mondays: Date[] = [];

    // Get 12 Mondays in the past
    for (let i = 12; i >= 1; i--) {
        const past = new Date(currentMonday);
        past.setDate(currentMonday.getDate() - i * 7);
        mondays.push(past);
    }

    // Add current Monday
    mondays.push(currentMonday);

    // Get 11 Mondays in the future
    for (let i = 1; i <= 11; i++) {
        const future = new Date(currentMonday);
        future.setDate(currentMonday.getDate() + i * 7);
        mondays.push(future);
    }

    return mondays;
};

const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    });
};

const calculateEndDate = (startDateStr: string): string => {
    const start = new Date(startDateStr);
    const end = new Date(start);
    end.setDate(start.getDate() + 83); // 12 weeks - 1 day to get Sunday
    return end.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    });
};

export const Planning: React.FC<PlanningProps> = ({
    goals,
    tactics,
    cycle,
    actualWeek,
    onAddGoal,
    onUpdateGoal,
    onDeleteGoal,
    onAddTactic,
    onUpdateTacticMeta,
    onDeleteTactic,
    onReorderGoals,
    onReorderTactics,
    onUpdateCycleStartDate,
    onSetWeek,
    onFinish,
}) => {
    const [activeGoalId, setActiveGoalId] = useState<string | null>(
        goals[0]?.id || null,
    );
    const [confirmSwitch, setConfirmSwitch] = useState<{
        tacticId: string;
        newType: "daily" | "weekly";
    } | null>(null);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [draggedGoalIdx, setDraggedGoalIdx] = useState<number | null>(null);
    const [draggedTacticIdx, setDraggedTacticIdx] = useState<number | null>(
        null,
    );
    const prevGoalsLengthRef = useRef(goals.length);
    const goalNameInputRef = useRef<HTMLInputElement>(null);
    const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
    const dateDropdownRef = useRef<HTMLDivElement>(null);
    const dateDropdownScrollRef = useRef<HTMLDivElement>(null);
    const prevTacticsLengthRef = useRef(tactics.length);
    const tacticNameInputRefs = useRef<{
        [key: string]: HTMLInputElement | null;
    }>({});

    const selectedGoal = goals.find((g) => g.id === activeGoalId);
    const selectedGoalTactics = tactics.filter(
        (t) => t.goalId === activeGoalId,
    );

    const mondays = getMondays();
    const weeksRemaining = 12 - actualWeek + 1;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dateDropdownRef.current &&
                !dateDropdownRef.current.contains(event.target as Node)
            ) {
                setIsDateDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Auto-select newly added goal and focus input
    useEffect(() => {
        if (goals.length > prevGoalsLengthRef.current) {
            // A new goal was added - select the last one
            const newGoal = goals[goals.length - 1];
            setActiveGoalId(newGoal.id);
            // Focus the input after a short delay to ensure it's rendered
            setTimeout(() => {
                goalNameInputRef.current?.focus();
            }, 50);
        }
        prevGoalsLengthRef.current = goals.length;
    }, [goals]);

    // Auto-focus newly added tactic
    useEffect(() => {
        if (tactics.length > prevTacticsLengthRef.current) {
            // A new tactic was added - focus the last one
            const newTactic = tactics[tactics.length - 1];
            setTimeout(() => {
                tacticNameInputRefs.current[newTactic.id]?.focus();
                tacticNameInputRefs.current[newTactic.id]?.select();
            }, 50);
        }
        prevTacticsLengthRef.current = tactics.length;
    }, [tactics]);

    // Auto-scroll date dropdown to show selected or current week at top
    useEffect(() => {
        if (isDateDropdownOpen && dateDropdownScrollRef.current) {
            const currentMonday = snapToMonday(new Date());
            const selectedDate = new Date(cycle.startDate);

            // Determine which date to scroll to: selected date or current week
            const targetDate = selectedDate.toDateString() === currentMonday.toDateString()
                ? currentMonday  // If selected is current week, scroll to current week
                : selectedDate;  // Otherwise scroll to selected week

            // Find the index of the target date in mondays array
            const targetIndex = mondays.findIndex(
                (m) => m.toDateString() === targetDate.toDateString()
            );

            if (targetIndex !== -1) {
                // Each button is approximately 49px (py-3 = 12px top + 12px bottom + content)
                const itemHeight = 49;
                // Scroll so the target item is visible but not at position 0
                // We want it to be the first fully visible item, so we scroll to show the previous item partially
                // This ensures the target is at the top but fully visible
                const scrollPosition = Math.max(0, (targetIndex - 1) * itemHeight);

                setTimeout(() => {
                    dateDropdownScrollRef.current?.scrollTo({
                        top: scrollPosition,
                        behavior: 'auto'  // Changed to 'auto' for instant scroll, no animation
                    });
                }, 50);  // Increased delay to ensure DOM is fully rendered
            }
        }
    }, [isDateDropdownOpen, cycle.startDate, mondays]);

    const handleGoalDragStart = (e: React.DragEvent, index: number) => {
        setDraggedGoalIdx(index);
        e.dataTransfer.effectAllowed = "move";
        const card = (e.currentTarget as HTMLElement).closest(
            "[data-drag-card]",
        ) as HTMLElement | null;
        const dragImage = card ?? (e.currentTarget as HTMLElement);
        const rect = dragImage.getBoundingClientRect();
        e.dataTransfer.setDragImage(dragImage, rect.width / 2, 20);
    };

    const handleGoalDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        const scrollContainer = document.querySelector("main");
        if (scrollContainer) {
            const rect = scrollContainer.getBoundingClientRect();
            const threshold = 80;
            if (e.clientY - rect.top < threshold) {
                scrollContainer.scrollBy({top: -12, behavior: "auto"});
            } else if (rect.bottom - e.clientY < threshold) {
                scrollContainer.scrollBy({top: 12, behavior: "auto"});
            }
        }
        if (draggedGoalIdx === null || draggedGoalIdx === index) return;
        const newGoals = [...goals];
        const draggedItem = newGoals[draggedGoalIdx];
        newGoals.splice(draggedGoalIdx, 1);
        newGoals.splice(index, 0, draggedItem);
        setDraggedGoalIdx(index);
        onReorderGoals(newGoals);
    };

    const handleTacticDragStart = (e: React.DragEvent, index: number) => {
        setDraggedTacticIdx(index);
        e.dataTransfer.effectAllowed = "move";
        const card = (e.currentTarget as HTMLElement).closest(
            "[data-drag-card]",
        ) as HTMLElement | null;
        const dragImage = card ?? (e.currentTarget as HTMLElement);
        const rect = dragImage.getBoundingClientRect();
        e.dataTransfer.setDragImage(dragImage, rect.width / 2, 20);
    };

    const handleTacticDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        const scrollContainer = document.querySelector("main");
        if (scrollContainer) {
            const rect = scrollContainer.getBoundingClientRect();
            const threshold = 80;
            if (e.clientY - rect.top < threshold) {
                scrollContainer.scrollBy({top: -12, behavior: "auto"});
            } else if (rect.bottom - e.clientY < threshold) {
                scrollContainer.scrollBy({top: 12, behavior: "auto"});
            }
        }
        if (draggedTacticIdx === null || draggedTacticIdx === index) return;
        const filtered = [...selectedGoalTactics];
        const draggedItem = filtered[draggedTacticIdx];
        filtered.splice(draggedTacticIdx, 1);
        filtered.splice(index, 0, draggedItem);
        const otherTactics = tactics.filter((t) => t.goalId !== activeGoalId);
        onReorderTactics([...otherTactics, ...filtered]);
        setDraggedTacticIdx(index);
    };

    const addMeasurement = (goalId: string) => {
        const currentConfigs = selectedGoal?.measurementConfigs || [];
        const newConfig: MeasurementConfig = {
            id: Math.random().toString(36).substr(2, 9),
            name: "",
            unit: "",
            target: undefined,
        };
        onUpdateGoal(goalId, {
            measurementConfigs: [...currentConfigs, newConfig],
        });
    };

    const updateMeasurement = (
        goalId: string,
        configId: string,
        updates: Partial<MeasurementConfig>,
    ) => {
        const currentConfigs = selectedGoal?.measurementConfigs || [];
        const next = currentConfigs.map((c) =>
            c.id === configId ? {...c, ...updates} : c,
        );
        onUpdateGoal(goalId, {measurementConfigs: next});
    };

    const removeMeasurement = (goalId: string, configId: string) => {
        const currentConfigs = selectedGoal?.measurementConfigs || [];
        const next = currentConfigs.filter((c) => c.id !== configId);
        onUpdateGoal(goalId, {measurementConfigs: next});
    };

    const handleTypeChange = (tactic: Tactic, newType: "daily" | "weekly") => {
        if (tactic.type === newType) return;
        const hasData = Object.values(tactic.completions).some((val) => {
            if (Array.isArray(val)) return val.some((b) => b === true);
            return val === true;
        });
        if (hasData) {
            setConfirmSwitch({tacticId: tactic.id, newType});
        } else {
            onUpdateTacticMeta(tactic.id, {type: newType, completions: {}});
        }
    };

    const handleResetToThisWeek = async () => {
        const thisMonday = snapToMonday(new Date());
        await onUpdateCycleStartDate(thisMonday.toISOString());
        await onSetWeek(1);
        setIsDateDropdownOpen(false);
        setShowResetConfirm(false);

        // Redirect to dashboard where toast will be visible
        onFinish();
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 pb-20">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">
                    Your 12-Week Plan
                </h1>
            </div>

            {/* Cycle Control Section */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-5">
                <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--text-muted)]">
                        Choose your start date
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Start Date Dropdown */}
                    <div className="space-y-2" ref={dateDropdownRef}>
                        <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] ml-1 tracking-wider">
                            Start Date
                        </label>
                        <div className="relative">
                            <button
                                onClick={() =>
                                    setIsDateDropdownOpen(!isDateDropdownOpen)
                                }
                                className={`w-full flex items-center justify-between bg-[var(--background)] border border-[var(--border)] px-4 py-3 text-sm font-medium transition-all ${
                                    isDateDropdownOpen
                                        ? "rounded-t-xl border-b-[var(--card)]"
                                        : "rounded-xl hover:border-[var(--primary)]/50"
                                }`}>
                                <span className="text-[var(--text-main)]">
                                    {formatDate(cycle.startDate)}
                                </span>
                                <ChevronDown
                                    size={16}
                                    className={`text-[var(--primary)] transition-transform duration-200 ${
                                        isDateDropdownOpen ? "rotate-180" : ""
                                    }`}
                                />
                            </button>

                            {isDateDropdownOpen && (
                                <div
                                    ref={dateDropdownScrollRef}
                                    className="absolute top-full left-0 right-0 bg-[var(--background)] border border-[var(--border)] border-t-0 rounded-b-xl shadow-2xl z-50 max-h-[240px] overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--border)] scrollbar-track-transparent animate-in fade-in slide-in-from-top-1 duration-100">
                                    {mondays.map((monday) => {
                                        const mondayISO = monday.toISOString();
                                        const isSelected =
                                            new Date(
                                                cycle.startDate,
                                            ).toDateString() ===
                                            monday.toDateString();
                                        const isToday =
                                            snapToMonday(
                                                new Date(),
                                            ).toDateString() ===
                                            monday.toDateString();

                                        return (
                                            <button
                                                key={mondayISO}
                                                onClick={() => {
                                                    onUpdateCycleStartDate(
                                                        mondayISO,
                                                    );
                                                    setIsDateDropdownOpen(
                                                        false,
                                                    );
                                                }}
                                                className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors border-b border-[var(--border)]/50 last:border-0 ${
                                                    isSelected
                                                        ? "text-[var(--primary)] bg-[var(--primary)]/10"
                                                        : isToday
                                                        ? "text-[var(--text-main)] bg-[var(--secondary)]/5 hover:bg-[var(--secondary)]/10"
                                                        : "text-[var(--text-muted)] hover:bg-white/[0.03] hover:text-[var(--text-main)]"
                                                }`}>
                                                <div className="flex items-center justify-between">
                                                    <span>
                                                        {formatDate(mondayISO)}
                                                    </span>
                                                    {isToday && (
                                                        <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--secondary)]">
                                                            This Week
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* End Date (Read-only) */}
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] ml-1 tracking-wider">
                            End Date
                        </label>
                        <div className="bg-[var(--background)] border border-[var(--border)] px-4 py-3 rounded-xl text-sm font-medium text-[var(--text-muted)]">
                            {calculateEndDate(cycle.startDate)}
                        </div>
                    </div>
                </div>

                {/* Help Text */}
                <div className="pt-2">
                    <p className="text-xs text-[var(--text-muted)]">
                        Behind schedule? You can <button
                            onClick={() => setShowResetConfirm(true)}
                            className="text-[var(--primary)] underline hover:text-[var(--primary)]/80 transition-colors font-medium">reset to this week</button> to start fresh from Week 1.
                    </p>
                </div>

                {/* Cycle Progress */}
                <div className="pt-4 border-t border-[var(--border)]">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-[var(--text-muted)] uppercase tracking-widest font-bold">
                            Current Progress
                        </span>
                        <span className="text-[var(--primary)] font-mono font-bold">
                            Week {actualWeek} of 12
                        </span>
                    </div>
                    <div className="mt-2 h-2 bg-[var(--background)] rounded-full overflow-hidden border border-[var(--border)]">
                        <div
                            className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] transition-all duration-500"
                            style={{
                                width: `${(actualWeek / 12) * 100}%`,
                            }}
                        />
                    </div>
                    <div className="mt-2 text-right">
                        <span className="text-[10px] text-[var(--text-muted)] font-mono">
                            {weeksRemaining}{" "}
                            {weeksRemaining === 1 ? "week" : "weeks"} remaining
                        </span>
                    </div>
                </div>
            </div>

            {goals.length === 0 ? (
                /* Empty State */
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center space-y-6 max-w-md">
                        <div className="w-20 h-20 mx-auto bg-[var(--card)] rounded-2xl flex items-center justify-center border border-[var(--border)]">
                            <Target size={40} className="text-[var(--primary)]" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold">
                                Create Your First Goal
                            </h2>
                            <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                                Start your 12-week journey by defining a goal.
                                Break it down into daily and weekly tactics,
                                track measurements, and execute with purpose.
                            </p>
                        </div>
                        <button
                            onClick={() =>
                                onAddGoal({name: "", measurementConfigs: []})
                            }
                            className="inline-flex items-center gap-3 px-8 py-4 bg-[var(--primary)] text-black font-bold rounded-xl hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[var(--primary)]/20 uppercase tracking-widest text-xs">
                            <Plus size={18} /> Add Your First Goal
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-8">
                    <aside className="w-full lg:w-72 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold flex items-center gap-2 uppercase tracking-widest text-[10px] text-[var(--text-muted)]">
                                Goals
                            </h2>
                            <button
                                onClick={() =>
                                    onAddGoal({
                                        name: "",
                                        measurementConfigs: [],
                                    })
                                }
                                className="p-1.5 hover:bg-[var(--primary)]/10 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--primary)] transition-all">
                                <Plus size={18} />
                            </button>
                        </div>
                        <div className="space-y-2">
                            {goals.map((goal, idx) => (
                                <div
                                    key={goal.id}
                                    className={`relative group ${
                                        draggedGoalIdx === idx
                                            ? "opacity-40"
                                            : "opacity-100"
                                    }`}
                                    data-drag-card="goal"
                                    onDragOver={(e) =>
                                        handleGoalDragOver(e, idx)
                                    }
                                    onDragEnd={() => setDraggedGoalIdx(null)}>
                                    <button
                                        onClick={() => setActiveGoalId(goal.id)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 ${
                                            activeGoalId === goal.id
                                                ? "bg-[var(--card)] border-[var(--primary)] ring-1 ring-[var(--primary)]"
                                                : "bg-[var(--background)] border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--card)]"
                                        }`}>
                                        <div
                                            className="cursor-grab active:cursor-grabbing text-[var(--border)] group-hover:text-[var(--primary)] transition-colors"
                                            draggable
                                            onDragStart={(e) =>
                                                handleGoalDragStart(e, idx)
                                            }>
                                            <Grip size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0 pointer-events-none">
                                            <div className="font-bold text-sm mb-1 truncate">
                                                {goal.name || "Untitled Goal"}
                                            </div>
                                            <div className="text-[10px] uppercase font-mono text-[var(--text-muted)]">
                                                {
                                                    tactics.filter(
                                                        (t) =>
                                                            t.goalId ===
                                                            goal.id,
                                                    ).length
                                                }{" "}
                                                Tactics
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </aside>

                    <div className="flex-1 space-y-10">
                        {selectedGoal ? (
                            <>
                                {/* Goal Metadata Section */}
                                <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 mr-4">
                                            <input
                                                ref={goalNameInputRef}
                                                className="bg-transparent border-none text-2xl font-bold focus:outline-none w-full"
                                                value={selectedGoal.name}
                                                onChange={(e) =>
                                                    onUpdateGoal(
                                                        selectedGoal.id,
                                                        {name: e.target.value},
                                                    )
                                                }
                                                placeholder="Goal Name..."
                                            />
                                            <textarea
                                                className="bg-transparent border-none text-[var(--text-muted)] text-sm focus:outline-none w-full resize-none mt-2"
                                                value={selectedGoal.description}
                                                onChange={(e) =>
                                                    onUpdateGoal(
                                                        selectedGoal.id,
                                                        {
                                                            description:
                                                                e.target.value,
                                                        },
                                                    )
                                                }
                                                placeholder="Vision..."
                                                rows={2}
                                            />
                                        </div>
                                        <button
                                            onClick={() =>
                                                onDeleteGoal(selectedGoal.id)
                                            }
                                            className="p-2 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </section>

                                {/* Tactics Section */}
                                <section className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold flex items-center gap-2 tracking-tight">
                                            <ListTodo
                                                size={18}
                                                className="text-[var(--secondary)]"
                                            />{" "}
                                            Tactics
                                        </h3>
                                        <button
                                            onClick={() =>
                                                onAddTactic({
                                                    goalId: selectedGoal.id,
                                                    name: "",
                                                    type: "weekly",
                                                    assignedWeeks: [
                                                        1, 2, 3, 4, 5, 6, 7, 8,
                                                        9, 10, 11, 12,
                                                    ],
                                                })
                                            }
                                            className="flex items-center gap-2 text-xs font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-3 py-1.5 rounded-full border border-[var(--primary)]/20 hover:bg-[var(--primary)]/20 transition-all">
                                            <Plus size={14} /> Add Tactic
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {selectedGoalTactics.length > 0 ? (
                                            selectedGoalTactics.map(
                                                (tactic, idx) => (
                                                    <div
                                                        key={tactic.id}
                                                        className={`bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 space-y-4 relative group/tactic transition-opacity ${
                                                            draggedTacticIdx ===
                                                            idx
                                                                ? "opacity-40 border-dashed border-[var(--primary)]"
                                                                : "opacity-100"
                                                        }`}
                                                        data-drag-card="tactic"
                                                        onDragOver={(e) =>
                                                            handleTacticDragOver(
                                                                e,
                                                                idx,
                                                            )
                                                        }
                                                        onDragEnd={() =>
                                                            setDraggedTacticIdx(
                                                                null,
                                                            )
                                                        }>
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-center gap-3 flex-1 mr-4">
                                                                <div
                                                                    className="cursor-grab active:cursor-grabbing text-[var(--border)] group-hover/tactic:text-[var(--primary)] transition-colors"
                                                                    draggable
                                                                    onDragStart={(
                                                                        e,
                                                                    ) =>
                                                                        handleTacticDragStart(
                                                                            e,
                                                                            idx,
                                                                        )
                                                                    }>
                                                                    <GripVertical
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                </div>
                                                                <input
                                                                    ref={(
                                                                        el,
                                                                    ) => {
                                                                        tacticNameInputRefs.current[
                                                                            tactic.id
                                                                        ] = el;
                                                                    }}
                                                                    className="bg-transparent border-none text-base font-medium focus:outline-none w-full"
                                                                    value={
                                                                        tactic.name
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        onUpdateTacticMeta(
                                                                            tactic.id,
                                                                            {
                                                                                name: e
                                                                                    .target
                                                                                    .value,
                                                                            },
                                                                        )
                                                                    }
                                                                    placeholder="What needs to be done?"
                                                                />
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <TypeDropdown
                                                                    value={
                                                                        tactic.type
                                                                    }
                                                                    onChange={(
                                                                        val,
                                                                    ) =>
                                                                        handleTypeChange(
                                                                            tactic,
                                                                            val,
                                                                        )
                                                                    }
                                                                />
                                                                <button
                                                                    onClick={() =>
                                                                        onDeleteTactic(
                                                                            tactic.id,
                                                                        )
                                                                    }
                                                                    className="p-1 text-[var(--text-muted)] hover:text-red-500 transition-colors">
                                                                    <Trash2
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] flex items-center gap-1">
                                                                    <Calendar
                                                                        size={
                                                                            10
                                                                        }
                                                                    />{" "}
                                                                    Assigned Weeks
                                                                </label>
                                                                {(() => {
                                                                    const allWeeks = [
                                                                        1, 2, 3,
                                                                        4, 5, 6,
                                                                        7, 8, 9,
                                                                        10, 11,
                                                                        12,
                                                                    ];
                                                                    const isAllAssigned =
                                                                        allWeeks.every(
                                                                            (
                                                                                w,
                                                                            ) =>
                                                                                tactic.assignedWeeks.includes(
                                                                                    w,
                                                                                ),
                                                                        );
                                                                    return (
                                                                        <label className="flex items-center gap-2 text-[9px] uppercase font-bold text-[var(--text-muted)] cursor-pointer">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={
                                                                                    isAllAssigned
                                                                                }
                                                                                onChange={() => {
                                                                                    const next =
                                                                                        isAllAssigned
                                                                                            ? []
                                                                                            : allWeeks;
                                                                                    onUpdateTacticMeta(
                                                                                        tactic.id,
                                                                                        {
                                                                                            assignedWeeks:
                                                                                                next,
                                                                                        },
                                                                                    );
                                                                                }}
                                                                                className="h-3 w-3 accent-[var(--primary)]"
                                                                            />
                                                                            <span className="min-w-[86px] text-left">
                                                                                {isAllAssigned
                                                                                    ? "Deselect all"
                                                                                    : "Select all"}
                                                                            </span>
                                                                        </label>
                                                                    );
                                                                })()}
                                                            </div>
                                                            <div className="flex flex-wrap gap-1">
                                                                {[
                                                                    1, 2, 3, 4,
                                                                    5, 6, 7, 8,
                                                                    9, 10, 11,
                                                                    12,
                                                                ].map((w) => {
                                                                    const isAssigned =
                                                                        tactic.assignedWeeks.includes(
                                                                            w,
                                                                        );
                                                                    return (
                                                                        <button
                                                                            key={
                                                                                w
                                                                            }
                                                                            onClick={() => {
                                                                                const next =
                                                                                    isAssigned
                                                                                        ? tactic.assignedWeeks.filter(
                                                                                              (
                                                                                                  num,
                                                                                              ) =>
                                                                                                  num !==
                                                                                                  w,
                                                                                          )
                                                                                        : [
                                                                                              ...tactic.assignedWeeks,
                                                                                              w,
                                                                                          ].sort(
                                                                                              (
                                                                                                  a,
                                                                                                  b,
                                                                                              ) =>
                                                                                                  a -
                                                                                                  b,
                                                                                          );
                                                                                onUpdateTacticMeta(
                                                                                    tactic.id,
                                                                                    {
                                                                                        assignedWeeks:
                                                                                            next,
                                                                                    },
                                                                                );
                                                                            }}
                                                                            className={`w-8 h-8 rounded text-xs font-mono transition-all border ${
                                                                                isAssigned
                                                                                    ? "bg-[var(--primary)] border-[var(--primary)] text-black font-bold"
                                                                                    : "bg-[var(--background)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)]/50"
                                                                            }`}>
                                                                            {w}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ),
                                            )
                                        ) : (
                                            <div className="text-center py-16 border-2 border-dashed border-[var(--border)] rounded-3xl bg-[var(--card)]/30">
                                                <div className="w-12 h-12 bg-[var(--border)]/50 rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--text-muted)]/60">
                                                    <ListTodo size={24} />
                                                </div>
                                                <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">
                                                    No tactics defined yet.
                                                    Break down this goal into
                                                    daily or weekly actions to
                                                    drive execution.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* Measurements Section */}
                                <section className="space-y-6 pt-6 border-t border-[var(--border)]">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold flex items-center gap-2 tracking-tight">
                                            <BarChart3
                                                size={18}
                                                className="text-[var(--primary)]"
                                            />{" "}
                                            Measurements
                                        </h3>
                                        <button
                                            onClick={() =>
                                                addMeasurement(selectedGoal.id)
                                            }
                                            className="flex items-center gap-2 text-xs font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-3 py-1.5 rounded-full border border-[var(--primary)]/20 hover:bg-[var(--primary)]/20 transition-all">
                                            <Plus size={14} /> Add Metric
                                        </button>
                                    </div>

                                    <div className="space-y-8">
                                        {selectedGoal.measurementConfigs.map(
                                            (config) => (
                                                <div
                                                    key={config.id}
                                                    className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 relative group/metric transition-all hover:border-[var(--primary)]/20 shadow-xl">
                                                    <div className="space-y-8">
                                                        {/* Question 1 */}
                                                        <div className="space-y-3">
                                                            <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-[0.15em] block ml-1 opacity-70">
                                                                What are you
                                                                measuring?
                                                            </label>
                                                            <input
                                                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl py-4 px-5 focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 transition-all placeholder:text-[var(--border)] text-base font-medium"
                                                                value={
                                                                    config.name
                                                                }
                                                                onChange={(e) =>
                                                                    updateMeasurement(
                                                                        selectedGoal.id,
                                                                        config.id,
                                                                        {
                                                                            name: e
                                                                                .target
                                                                                .value,
                                                                        },
                                                                    )
                                                                }
                                                                placeholder="e.g. Revenue, Weight, Deep Work Hours..."
                                                            />
                                                        </div>

                                                        {/* Question 2 + Target Grid */}
                                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                                                            <div className="md:col-span-8 space-y-3">
                                                                <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-[0.15em] block ml-1 opacity-70">
                                                                    Metric or
                                                                    unit of
                                                                    measure
                                                                </label>
                                                                <input
                                                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl py-4 px-5 focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 transition-all placeholder:text-[var(--border)] text-sm"
                                                                    value={
                                                                        config.unit
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        updateMeasurement(
                                                                            selectedGoal.id,
                                                                            config.id,
                                                                            {
                                                                                unit: e
                                                                                    .target
                                                                                    .value,
                                                                            },
                                                                        )
                                                                    }
                                                                    placeholder="Dollars, Pounds, Calls, Hours, etc."
                                                                />
                                                            </div>
                                                            <div className="md:col-span-4 space-y-3">
                                                                <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-[0.15em] block ml-1 opacity-70 flex items-center justify-between">
                                                                    Goal Target{" "}
                                                                    <span className="opacity-40 italic lowercase font-normal tracking-normal">
                                                                        (Optional)
                                                                    </span>
                                                                </label>
                                                                <div className="relative">
                                                                    <input
                                                                        type="number"
                                                                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl py-4 px-5 focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 transition-all font-mono text-sm pr-12 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                        value={
                                                                            config.target ??
                                                                            ""
                                                                        }
                                                                        placeholder="0"
                                                                        onWheel={(e) => e.currentTarget.blur()}
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            updateMeasurement(
                                                                                selectedGoal.id,
                                                                                config.id,
                                                                                {
                                                                                    target:
                                                                                        e
                                                                                            .target
                                                                                            .value ===
                                                                                        ""
                                                                                            ? undefined
                                                                                            : parseFloat(
                                                                                                  e
                                                                                                      .target
                                                                                                      .value,
                                                                                              ),
                                                                                },
                                                                            )
                                                                        }
                                                                    />
                                                                    <div
                                                                        className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${
                                                                            config.target
                                                                                ? "text-[var(--primary)]"
                                                                                : "text-[var(--border)]"
                                                                        }`}>
                                                                        <Target
                                                                            size={
                                                                                16
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() =>
                                                            removeMeasurement(
                                                                selectedGoal.id,
                                                                config.id,
                                                            )
                                                        }
                                                        className="absolute top-4 right-4 p-2 text-[var(--border)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover/metric:opacity-100">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ),
                                        )}

                                        {selectedGoal.measurementConfigs
                                            .length === 0 && (
                                            <div className="text-center py-16 border-2 border-dashed border-[var(--border)] rounded-3xl bg-[var(--card)]/30">
                                                <div className="w-12 h-12 bg-[var(--border)]/50 rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--text-muted)]/60">
                                                    <Ruler size={24} />
                                                </div>
                                                <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">
                                                    No KPIs defined yet for this
                                                    goal. Add a measurement to
                                                    track your performance
                                                    trajectory.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </>
                        ) : (
                            <div className="h-full flex items-center justify-center py-20">
                                <div className="text-center space-y-4">
                                    <Target
                                        size={48}
                                        className="mx-auto text-[var(--border)]"
                                    />
                                    <p className="text-[var(--text-muted)]">
                                        Select a goal from the sidebar to start
                                        planning.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="pt-10 border-t border-[var(--border)] flex justify-end">
                            <button
                                onClick={onFinish}
                                className="flex items-center gap-3 px-8 py-3 bg-[var(--primary)] text-black font-bold rounded-xl hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[var(--primary)]/20 uppercase tracking-widest text-xs">
                                <ArrowLeft size={18} /> Save & Finish
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tactic Type Switch Confirmation Modal */}
            {confirmSwitch && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => setConfirmSwitch(null)}></div>
                    <div className="bg-[var(--card)] border border-[var(--border)] w-full max-w-md rounded-2xl p-8 relative animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
                                <AlertTriangle size={32} />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-bold">
                                    Wipe Completion Data?
                                </h2>
                                <p className="text-sm text-[var(--text-muted)]">
                                    Switching types will erase all existing
                                    progress for this tactic across all 12
                                    weeks. This cannot be undone.
                                </p>
                            </div>
                            <div className="flex gap-3 w-full mt-4">
                                <button
                                    onClick={() => setConfirmSwitch(null)}
                                    className="flex-1 bg-[var(--background)] border border-[var(--border)] py-3 rounded-xl font-bold">
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirmSwitch) {
                                            onUpdateTacticMeta(
                                                confirmSwitch.tacticId,
                                                {
                                                    type: confirmSwitch.newType,
                                                    completions: {},
                                                },
                                            );
                                            setConfirmSwitch(null);
                                        }
                                    }}
                                    className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold">
                                    Confirm Reset
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reset Dates Confirmation Modal */}
            {showResetConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center">
                    <div
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => setShowResetConfirm(false)}></div>
                    <div className="bg-[var(--card)] border border-[var(--border)] w-full max-w-md rounded-2xl p-8 relative animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center text-[var(--primary)]">
                                <RefreshCw size={32} />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-bold">
                                    Reset Plan Dates?
                                </h2>
                                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                                    This will restart your cycle from Week 1 beginning this Monday. Your completion data remains but may need adjustment.
                                </p>
                            </div>
                            <div className="flex gap-3 w-full mt-4">
                                <button
                                    onClick={() => setShowResetConfirm(false)}
                                    className="flex-1 bg-[var(--background)] border border-[var(--border)] py-3 rounded-xl font-bold hover:bg-[var(--card)] transition-all">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleResetToThisWeek}
                                    className="flex-1 bg-[var(--primary)] text-black py-3 rounded-xl font-bold hover:opacity-90 transition-all">
                                    Reset Dates
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
