"use client";

import { X, AlertTriangle, Activity, ArrowRight } from "lucide-react";

interface RiskDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    riskData: {
        score: number;
        level: string;
        label: string;
        description?: string;
    };
}

export default function RiskDetailsModal({ isOpen, onClose, riskData }: RiskDetailsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-orange-50 p-6 border-b border-orange-100 flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-orange-100 rounded-full">
                            <AlertTriangle className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Risk Assessment</h3>
                            <p className="text-sm text-orange-700 font-medium">{riskData.label}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-orange-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="bg-white border border-gray-100 shadow-sm p-4 rounded-xl">
                        <h4 className="text-sm font-semibold text-gray-500 mb-3">AI Analysis</h4>
                        <p className="text-gray-700 text-sm leading-relaxed">
                            {riskData.description || "Based on your recent health logs, our AI has detected a potential risk factor. This is calculated from your blood pressure trends and weight changes over the last 2 weeks."}
                        </p>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-gray-500 mb-3">Contributing Factors</h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Activity className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-700">Systolic BP</span>
                                </div>
                                <span className="text-sm font-bold text-red-500">Elevated</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Activity className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-700">Weight Gain</span>
                                </div>
                                <span className="text-sm font-bold text-orange-500">Rapid</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-black transition-colors flex items-center justify-center gap-2"
                    >
                        I Understand
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
