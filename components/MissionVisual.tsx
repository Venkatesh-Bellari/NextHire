import React from 'react';

const MissionVisual = () => (
    <div className="w-full h-full flex items-center justify-center p-8">
        <blockquote className="text-center">
            <p className="text-4xl lg:text-5xl font-bold text-slate-100 leading-tight tracking-tight">
                "The best way to predict the future is to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400">create</span> it."
            </p>
            <cite className="block mt-6 text-lg text-slate-400 not-italic">— Alan Kay</cite>
        </blockquote>
    </div>
);

export default MissionVisual;
