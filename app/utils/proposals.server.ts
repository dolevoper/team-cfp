import type { Proposal } from "./proposals.model";
import type { UserData } from "./session.server";
import { users } from "./users.server";

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

type GetAllProposalsConfig = { populate?: Partial<Record<"proposedBy", boolean>> };
export async function getAllProposals(config: { populate: { proposedBy: true } }): Promise<(Proposal & { proposedBy?: UserData })[]>;
export async function getAllProposals(config?: { populate?: { proposedBy?: false } }): Promise<Proposal[]>;
export async function getAllProposals({ populate }: GetAllProposalsConfig = {}): Promise<Proposal[] | (Proposal & { proposedBy: UserData })[]> {
    return proposals.map((proposal) => populate?.proposedBy ? {
        ...proposal,
        proposedBy: { ...users.get(proposal.proposedByPrincipalId) }
    } : { ...proposal });
}

export async function getProposalById(id: string): Promise<Proposal | undefined> {
    if (!proposalIdIndex.has(id)) {
        return;
    }

    return proposals[proposalIdIndex.get(id)!];
}
