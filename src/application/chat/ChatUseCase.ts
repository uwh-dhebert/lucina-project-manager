/**
 * Application Layer - Chat Use Case
 * Handles chat message processing with Grok AI
 * Restricted to project and wiki content only - with full RAG
 */

import { randomUUID } from 'crypto';
import { ChatMessage, ChatMessageId } from '@/domain/chat/entities/ChatMessage';
import { IGrokService } from '@/infrastructure/external';
import { createClient } from '@/utils/supabase/server';

export interface ChatUseCaseRequest {
  userId: string;
  conversationId: string;
  userMessage: string;
  contextDocumentIds?: string[];
  useRag?: boolean;
  pageContext?: string;
}

export interface ChatUseCaseResponse {
  messageId: string;
  conversationId: string;
  userMessage: string;
  assistantMessage: string;
  tokensUsed: {
    prompt: number;
    completion: number;
  };
  model: string;
}

interface UserContext {
  projects: Array<{ id: string; name: string; description?: string; slug?: string }>;
  wikiTopics: Array<{ id: string; title: string; subjects?: Array<{ id: string; title: string; contentItems?: Array<{ title?: string; content: string }> }> }>;
  links: Array<{ id: string; title: string; url: string; description?: string }>;
  summary: string;
}

export class ChatUseCase {
  constructor(private grokService: IGrokService) {}

  async execute(request: ChatUseCaseRequest): Promise<ChatUseCaseResponse> {
    const messageId = randomUUID();

    // Load comprehensive user context
    const userContext = await this.loadUserContext(request.userId);

    // Check if question is relevant to available content
    const isRelevant = this.isQuestionRelevant(request.userMessage, userContext);

    if (!isRelevant && userContext.summary) {
      // If question is off-topic, return restricted response
      return {
        messageId,
        conversationId: request.conversationId,
        userMessage: request.userMessage,
        assistantMessage: `I can only help with questions about your projects and wiki content. I don't have information about "${request.userMessage}".\n\nHere's what I can help you with:\n${userContext.summary}`,
        tokensUsed: { prompt: 0, completion: 0 },
        model: 'grok-4-1-fast-non-reasoning',
      };
    }

    // Build context documents from projects and wiki
    const contextDocs = this.buildContextDocuments(userContext);

    // Build messages array with user message
    const messages = [
      {
        role: 'user' as const,
        content: request.userMessage,
      },
    ];

    // Prepare Grok request with full context
    const grokRequest = {
      messages,
      temperature: 0.7,
      max_tokens: 2048,
      systemPrompt: this.buildSystemPrompt(userContext, contextDocs, request.pageContext),
    };

    // Call Grok service with RAG
    const grokResponse = await this.grokService.ragChat(
      grokRequest,
      contextDocs
    );

    return {
      messageId,
      conversationId: request.conversationId,
      userMessage: request.userMessage,
      assistantMessage: grokResponse.content,
      tokensUsed: grokResponse.tokens,
      model: grokResponse.model,
    };
  }

  private async loadUserContext(userId: string): Promise<UserContext> {
    try {
      const supabase = await createClient();

      // Fetch user's projects with details
      const { data: projects } = await supabase
        .from('projects')
        .select('id, name, description, slug')
        .eq('ownerId', userId)
        .limit(100);

      // Fetch user's wiki structure (topics, subjects, content items)
      const { data: wikiTopics } = await supabase
        .from('wiki_topics')
        .select('id, title')
        .eq('userId', userId)
        .limit(100);

      let enrichedWikiTopics: UserContext['wikiTopics'] = [];

      // For each wiki topic, fetch subjects and content
      if (wikiTopics && wikiTopics.length > 0) {
        for (const topic of wikiTopics) {
          const { data: subjects } = await supabase
            .from('wiki_subjects')
            .select('id, title')
            .eq('topicId', topic.id)
            .limit(50);

          let enrichedSubjects: any[] = [];
          if (subjects && subjects.length > 0) {
            for (const subject of subjects) {
              const { data: contentItems } = await supabase
                .from('wiki_content_items')
                .select('title, content')
                .eq('subjectId', subject.id)
                .limit(100);

              enrichedSubjects.push({
                id: subject.id,
                title: subject.title,
                contentItems: contentItems || [],
              });
            }
          }

          enrichedWikiTopics.push({
            id: topic.id,
            title: topic.title,
            subjects: enrichedSubjects,
          });
        }
      }

      // Fetch user's links
      const { data: links } = await supabase
        .from('links')
        .select('id, title, url, description')
        .eq('userId', userId)
        .limit(100);

      // Build summary
      let summary = '';
      const projectCount = projects?.length || 0;
      const topicCount = wikiTopics?.length || 0;
      const linkCount = links?.length || 0;

      if (projectCount > 0) {
        summary += `📊 **Projects** (${projectCount}): ${(projects || []).map(p => p.name).join(', ')}\n`;
      }
      if (topicCount > 0) {
        summary += `📚 **Wiki Topics** (${topicCount}): ${(wikiTopics || []).map(t => t.title).join(', ')}\n`;
      }
      if (linkCount > 0) {
        summary += `🔗 **Links** (${linkCount}): You have ${linkCount} saved links\n`;
      }

      return {
        projects: projects || [],
        wikiTopics: enrichedWikiTopics,
        links: links || [],
        summary: summary || 'No projects or wiki content yet.',
      };
    } catch (error) {
      console.error('Error loading user context:', error);
      return {
        projects: [],
        wikiTopics: [],
        links: [],
        summary: 'I can help you with your projects and wiki content.',
      };
    }
  }

  private buildContextDocuments(context: UserContext): string[] {
    const docs: string[] = [];

    // Add project information
    if (context.projects.length > 0) {
      context.projects.forEach(project => {
        const doc = `PROJECT: ${project.name}
Slug: ${project.slug || 'N/A'}
${project.description ? `Description: ${project.description}` : ''}
---`;
        docs.push(doc);
      });
    }

    // Add wiki information
    if (context.wikiTopics.length > 0) {
      context.wikiTopics.forEach(topic => {
        let topicDoc = `WIKI TOPIC: ${topic.title}\n`;
        if (topic.subjects && topic.subjects.length > 0) {
          topic.subjects.forEach(subject => {
            topicDoc += `\nSUBJECT: ${subject.title}\n`;
            if (subject.contentItems && subject.contentItems.length > 0) {
              subject.contentItems.forEach(item => {
                topicDoc += `${item.title ? `- ${item.title}: ` : ''}${item.content.substring(0, 500)}...\n`;
              });
            }
          });
        }
        topicDoc += '---';
        docs.push(topicDoc);
      });
    }

    // Add links information
    if (context.links.length > 0) {
      let linksDoc = 'SAVED LINKS:\n';
      context.links.forEach(link => {
        linksDoc += `- [${link.title}](${link.url})${link.description ? `: ${link.description}` : ''}\n`;
      });
      linksDoc += '---';
      docs.push(linksDoc);
    }

    return docs.length > 0 ? docs : ['No project or wiki content available'];
  }

  private isQuestionRelevant(question: string, context: UserContext): boolean {
    const lowerQuestion = question.toLowerCase();

    // Check for project management related keywords
    const projectKeywords = [
      'project', 'task', 'work', 'deadline', 'assignee', 'status', 'progress',
      'create', 'update', 'delete', 'manage', 'plan', 'schedule', 'timeline',
      'project name', 'project details', 'project description',
    ];

    // Check for wiki/documentation keywords
    const wikiKeywords = [
      'wiki', 'documentation', 'document', 'subject', 'topic', 'content', 'write',
      'edit', 'page', 'section', 'note', 'reference', 'guide', 'tutorial', 'wiki topic',
    ];

    // Check for link-related keywords
    const linkKeywords = [
      'link', 'url', 'website', 'web', 'resource', 'reference',
    ];

    // Check if question contains relevant keywords
    const hasProjectKeyword = projectKeywords.some(keyword => lowerQuestion.includes(keyword));
    const hasWikiKeyword = wikiKeywords.some(keyword => lowerQuestion.includes(keyword));
    const hasLinkKeyword = linkKeywords.some(keyword => lowerQuestion.includes(keyword));

    // Check if question mentions any of the user's content
    const mentionsUserContent =
      context.projects.some(p => lowerQuestion.includes(p.name.toLowerCase())) ||
      context.wikiTopics.some(t => lowerQuestion.includes(t.title.toLowerCase())) ||
      context.links.some(l => lowerQuestion.includes(l.title.toLowerCase())) ||
      lowerQuestion.includes('my project') ||
      lowerQuestion.includes('my wiki') ||
      lowerQuestion.includes('my content');

    return hasProjectKeyword || hasWikiKeyword || hasLinkKeyword || mentionsUserContent;
  }

  private buildSystemPrompt(context: UserContext, contextDocs: string[], pageContext?: string): string {
    const projectList = context.projects.length > 0
      ? `\n\nUser's Projects:\n${context.projects.map(p => `- ${p.name}${p.description ? `: ${p.description}` : ''}`).join('\n')}`
      : '';

    const topicList = context.wikiTopics.length > 0
      ? `\n\nUser's Wiki Topics:\n${context.wikiTopics.map(t => `- ${t.title}${t.subjects ? ` (${t.subjects.length} subjects)` : ''}`).join('\n')}`
      : '';

    const linkList = context.links.length > 0
      ? `\n\nUser's Saved Links: ${context.links.length} links available`
      : '';

    const pageContextInfo = pageContext ? `\n\nCURRENT PAGE CONTEXT:\n${this.getPageContextInfo(pageContext, context)}` : '';

    return `You are Grok, an AI assistant restricted to helping only with project management and wiki/documentation content.

CRITICAL RESTRICTIONS:
- You ONLY answer questions about the user's projects and wiki content.
- You ONLY help with project management tasks (planning, scheduling, organizing, tracking).
- You ONLY help with documentation/wiki topics (writing, organizing, referencing content).
- You can reference saved links when relevant to user's content.
- For any question outside these scopes, politely decline and redirect to these topics.
- Do NOT provide general knowledge answers, coding help, or answers unrelated to projects/wiki.
- You MUST use the provided project and wiki content to answer questions accurately.

${projectList}${topicList}${linkList}${pageContextInfo}

INSTRUCTIONS:
- Use the provided project and wiki information to answer questions
- Reference specific projects, topics, or content items when relevant
- If asked about specific projects or wiki topics, provide detailed information from the content
- When answering, cite the relevant project or wiki topic
- Be conversational and helpful while staying within scope
- When appropriate, reference the current page context to provide more relevant information`;
  }

  private getPageContextInfo(pageContext: string, context: UserContext): string {
    if (pageContext.includes('user_is_viewing_project:')) {
      const projectSlug = pageContext.split(':')[1];
      const project = context.projects.find(p => p.slug === projectSlug);
      if (project) {
        return `The user is currently viewing the project "${project.name}". 
You should provide information specific to this project when asked general questions about projects.
When user asks about "this project" or "the current project", refer to "${project.name}".`;
      }
    } else if (pageContext.includes('user_is_viewing_wiki_topic:')) {
      const parts = pageContext.split('_');
      const topicPart = parts.find(p => p.startsWith('user_is_viewing_wiki_topic:'));
      const topicSlug = topicPart?.split(':')[1];
      const subjectPart = parts.find(p => p.startsWith('subject:'));
      const subjectSlug = subjectPart?.split(':')[1];

      let topicInfo = '';
      if (topicSlug) {
        const topic = context.wikiTopics.find(t => t.title.toLowerCase() === topicSlug?.toLowerCase());
        if (topic) {
          topicInfo = `The user is currently viewing the wiki topic "${topic.title}"`;
          if (subjectSlug) {
            const subject = topic.subjects?.find(s => s.title.toLowerCase() === subjectSlug?.toLowerCase());
            if (subject) {
              topicInfo += ` and the subject "${subject.title}"`;
            }
          }
          topicInfo += '.\nYou should provide information specific to this wiki topic when asked general questions about documentation.\nWhen user asks about "this topic" or "the current wiki", refer to this content.';
        }
      }
      return topicInfo || 'The user is currently viewing a wiki topic. Provide context-aware information when asked.';
    } else if (pageContext === 'user_is_on_projects_page') {
      return 'The user is on the projects page. They may want to know about their projects or create new ones.';
    } else if (pageContext === 'user_is_on_wiki_page') {
      return 'The user is on the wiki page. They may want to know about their documentation or create new wiki content.';
    } else if (pageContext === 'user_is_on_dashboard') {
      return 'The user is on the dashboard. Provide a quick summary of their projects and wiki if asked.';
    } else if (pageContext === 'user_is_on_links_page') {
      return `The user is on the links page. They have ${context.links.length} saved links. Help them organize or find specific links.`;
    }

    return 'The user is using the app. Help them with their projects and wiki content.';
  }
}

