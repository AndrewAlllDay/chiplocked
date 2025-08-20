// src/components/RulesScreen.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { ease: 'easeOut', duration: 0.4 }
    },
};

const RuleSection = ({ title, children }) => (
    <motion.div variants={itemVariants} className="mb-8">
        <h2 className="text-2xl font-bold text-cyan-400 mb-2">{title}</h2>
        <p className="text-slate-300 leading-relaxed">{children}</p>
    </motion.div>
);

const RulesScreen = () => {
    return (
        <div className="bg-slate-900 text-white min-h-screen">
            <div className="max-w-3xl mx-auto p-6 md:p-10">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={itemVariants}>
                        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">How to Play</h1>
                        <p className="text-center text-slate-400 mb-12">The official rules for ChipLocked.</p>
                    </motion.div>

                    <RuleSection title="Getting to Know the Chips">
                        Before starting a round of disc golf with Chip Locked, all players should familiarize themselves with how each chip is scored. Visit chiplocked.com and click on the chips to learn more.
                    </RuleSection>

                    <RuleSection title="The Drive">
                        On the first tee, the most experienced player throws first, and so on, to the least experienced player. On subsequent holes, players tee off based on the scores of the previous hole, so that the player with the lowest score on the last hole throws first and so on. The chips 'PURED' and 'TREE'd' can only be earned on a drive.
                    </RuleSection>

                    <RuleSection title="Upshots">
                        After all players have thrown their drive, the player whose disc is farthest from the basket throws next until all players have finished the hole. The chips 'PARKED' and 'SCRAMBLE' can only be earned from outside Circle 2 or farther away from the basket.
                    </RuleSection>

                    <RuleSection title="Putting">
                        The putting green is made up of 2 circles around the basket. Circle 1 is 10m (33ft) from the basket and Circle 2 is 20m (66ft) from the basket. These circles will be important when figuring out what chips you can earn. The chips 'ALL PUTTERS', 'DROP-IN', and 'AIR BALL' can only be earned from the putting green.
                    </RuleSection>

                    <RuleSection title="Scores">
                        At the end of each hole, players take the number of their throws, plus any penalty throws, and ensure that it is input for the hole. The chips 'ACE', 'EAGLE', 'BIRDIE', 'BOGEY', 'DOUBLE', and 'TRIPLE+' are earned by determining a player's score compared to par.
                    </RuleSection>

                    <RuleSection title="Collecting Chips">
                        When a player has earned a chip, they collect it from the Chip Locked bag if no one has earned it yet. Otherwise, they take it from the player in possession of it.
                    </RuleSection>

                    <RuleSection title="Chip Score">
                        The chip score is calculated by subtracting the number of good chips from the number of bad chips in your possession. The chip score is used differently depending on the 'Ways to Play' that you selected.
                    </RuleSection>

                    <RuleSection title="Enjoy">
                        The number one rule is to have fun and enjoy yourself. If you're ever unsure if a throw counts for a chip, ask your card before throwing and try to choose what would be the most exciting option.
                    </RuleSection>

                    <motion.div variants={itemVariants} className="text-center mt-12">
                        <Link
                            to="/"
                            className="inline-block bg-cyan-600 hover:bg-cyan-500 rounded-lg px-8 py-3 font-semibold transition-colors text-lg"
                        >
                            Back to Home
                        </Link>
                    </motion.div>

                </motion.div>
            </div>
        </div>
    );
};

export default RulesScreen;