function validateEnum<T extends readonly any[]>(options: T) {
    return function (x: any): x is T[number] {
        return options.some((option) => option === x);
    };
}

export const proposalTypes = ["", "Talk", "Workshop"] as const;
export const isValidProposalType = validateEnum(proposalTypes);

export const proposalLengths = ["", "15 mins", "30 mins", "45 mins", "1 hour", "1.5 hours"] as const;
export const isValidProposalLength = validateEnum(proposalLengths);

export interface Proposal {
    id: string;
    title: string;
    proposedByPrincipalId: string;
    type: typeof proposalTypes[number];
    length: typeof proposalLengths[number];
    description: string;
    createdAt: Date;
}

export function formatProposalDate(createdAt: string) {
    return new Intl.DateTimeFormat("en-US").format(
        new Date(createdAt)
    );
}
