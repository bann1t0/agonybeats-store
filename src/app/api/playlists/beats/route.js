import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// POST /api/playlists/beats - Add beat to playlist
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { playlistId, beatId } = await req.json();

        if (!playlistId || !beatId) {
            return NextResponse.json({ error: "playlistId and beatId required" }, { status: 400 });
        }

        // Check ownership
        const playlist = await prisma.playlist.findUnique({
            where: { id: playlistId },
            include: { beats: true }
        });

        if (!playlist) {
            return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
        }

        if (playlist.userId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Check if already in playlist
        const exists = playlist.beats.find(pb => pb.beatId === beatId);
        if (exists) {
            return NextResponse.json({ error: "Beat already in playlist" }, { status: 400 });
        }

        const playlistBeat = await prisma.playlistBeat.create({
            data: {
                playlistId,
                beatId,
                order: playlist.beats.length
            }
        });

        return NextResponse.json(playlistBeat);

    } catch (error) {
        console.error("Add to playlist error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/playlists/beats?playlistBeatId=xxx - Remove beat from playlist
export async function DELETE(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const playlistBeatId = searchParams.get('playlistBeatId');

        if (!playlistBeatId) {
            return NextResponse.json({ error: "playlistBeatId required" }, { status: 400 });
        }

        // Check ownership
        const playlistBeat = await prisma.playlistBeat.findUnique({
            where: { id: playlistBeatId },
            include: { playlist: true }
        });

        if (!playlistBeat) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        if (playlistBeat.playlist.userId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.playlistBeat.delete({
            where: { id: playlistBeatId }
        });

        return NextResponse.json({ message: "Removed from playlist" });

    } catch (error) {
        console.error("Remove from playlist error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
