// src/components/RulesContent.jsx

import React from 'react';
import { motion } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { ease: 'easeOut', duration: 0.3 }
    },
};

const RuleSection = ({ title, children }) => (
    <motion.div variants={itemVariants} className="mb-6">
        <h2 className="text-xl font-bold text-cyan-400 mb-1">{title}</h2>
        <p className="text-slate-300 leading-relaxed text-sm">{children}</p>
    </motion.div>
);

const RulesContent = () => {
    return (
        <div className="max-h-[70vh] overflow-y-auto pr-3 text-left">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <RuleSection title="Getting to Know the Chips">
                    Before starting a round of disc golf with Chip Locked, all players should familiarize themselves with how each chip is scored.
                </RuleSection>

                <RuleSection title="The Drive">
                    On the first tee, the most experienced player throws first. On subsequent holes, players tee off based on the scores of the previous hole. The chips 'PURED' and 'TREE'd' can only be earned on a drive.
                </RuleSection>

                <RuleSection title="Upshots">
                    After the drive, the player farthest from the basket throws next until the hole is finished. The chips 'PARKED' and 'SCRAMBLE' can only be earned from outside Circle 2.
                </RuleSection>

                <RuleSection title="Putting">
                    The putting green consists of Circle 1 (10m) and Circle 2 (20m). The chips 'ALL PUTTERS', 'DROP-IN', and 'AIR BALL' can only be earned from the putting green.
                </RuleSection>

                <RuleSection title="Scores">
                    At the end of each hole, player scores are determined by their throws plus any penalties. The chips 'ACE', 'EAGLE', 'BIRDIE', 'BOGEY', etc., are earned by comparing a player's score to par.
                </RuleSection>

                <RuleSection title="Collecting Chips">
                    When a player earns a chip, they collect it from the bag. If another player already holds it, they take it from that player.
                </RuleSection>

                <RuleSection title="Chip Score">
                    The chip score is calculated by subtracting good chips from bad chips. This score is used differently depending on the 'Ways to Play' selected.
                </RuleSection>

                <RuleSection title="Enjoy">
                    The number one rule is to have fun. If you're ever unsure about a throw, ask your card before throwing and choose the most exciting option.
                </RuleSection>
            </motion.div>
        </div>
    );
};

export default RulesContent;