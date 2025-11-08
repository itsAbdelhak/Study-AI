
import React, { useState } from 'react';

interface ConfidenceRaterProps {
    onSubmit: (rating: number) => void;
}

const StarIcon: React.FC<{ filled: boolean; onHover: () => void; onClick: () => void }> = ({ filled, onHover, onClick }) => (
    <svg 
        onMouseEnter={onHover}
        onClick={onClick}
        className={`w-10 h-10 cursor-pointer transition-colors duration-200 ${filled ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`}
        fill="currentColor" 
        viewBox="0 0 20 20"
    >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);


export const ConfidenceRater: React.FC<ConfidenceRaterProps> = ({ onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);

    const handleClick = (index: number) => {
        setRating(index);
        // Add a small delay so the user sees their selection before the modal closes
        setTimeout(() => onSubmit(index), 200);
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center"
                onMouseLeave={() => setHoverRating(0)}
            >
                <h2 className="text-xl font-bold text-gray-800 mb-2">Great work!</h2>
                <p className="text-gray-500 mb-6">How confident do you feel about this topic?</p>
                
                <div className="flex justify-center items-center gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map(index => (
                        <StarIcon 
                            key={index}
                            filled={(hoverRating || rating) >= index}
                            onHover={() => setHoverRating(index)}
                            onClick={() => handleClick(index)}
                        />
                    ))}
                </div>

                <p className="text-sm text-gray-400">Your feedback helps me tailor the next steps.</p>
            </div>
        </div>
    );
};