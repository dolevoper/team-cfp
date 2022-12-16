import type { Proposal } from "./proposals.model";

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
