function validateEnum<T extends readonly any[]>(options: T) {
    return function (x: any): x is T[number] {
        return options.some((option) => option === x);
    };
}

const proposalTypes = ["", "Talk", "Workshop"] as const;
export const isValidProposalType = validateEnum(proposalTypes);

const proposalLength = ["", "15 mins", "30 mins", "45 mins", "1 hour"] as const;
export const isValidProposalLength = validateEnum(proposalLength);

export interface Proposal {
    id: string;
    title: string;
    type: typeof proposalTypes[number];
    length: typeof proposalLength[number];
    description: string;
    createdAt: Date;
}

declare global {
    var __proposals: Proposal[];
    var __proposalIdIndex: Map<string, number>;
}

if (!global.__proposals) {
    global.__proposals = [];
    global.__proposalIdIndex = new Map<string, number>();
}

const proposals = global.__proposals;
const proposalIdIndex = global.__proposalIdIndex;

export class ConflictError extends Error {}

export async function submitProposal(proposal: Omit<Proposal, "createdAt">) {
    const { id } = proposal;

    if (proposalIdIndex.has(id)) {
        throw new ConflictError(`Proposal with id ${id} already exists.`);
    }

    proposalIdIndex.set(id, proposals.length);
    proposals.push({ ...proposal, createdAt: new Date() });
}

export async function getAllProposals() {
    return proposals.map((proposal) => ({ ...proposal }));
}

export async function getProposalById(id: string): Promise<Proposal | undefined> {
    if (!proposalIdIndex.has(id)) {
        return;
    }

    return proposals[proposalIdIndex.get(id)!];
}
