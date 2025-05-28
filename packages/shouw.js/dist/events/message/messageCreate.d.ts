import type { Message } from 'discord.js';
import { type ShouwClient } from '../..';
export default function Events(message: Message, client: ShouwClient): Promise<void>;
