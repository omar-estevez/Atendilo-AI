import { create } from "zustand";
import {
    templatesService,
    type CreateTemplatePayload,
    type Template,
} from "@/services/dashboard/templatesService";

interface TemplatesStore {
    templates: Template[];
    selectedTemplate: Template | null;

    isLoading: boolean;
    error: string | null;

    loadTemplates: () => Promise<void>;
    createTemplate: (payload: CreateTemplatePayload) => Promise<void>;
    updateTemplate: (
        template: Template,
        payload: Partial<Template>
    ) => Promise<void>;
    toggleTemplate: (template: Template) => Promise<void>;
    deleteTemplate: (template: Template) => Promise<void>;
    selectTemplate: (template: Template | null) => void;
    clearError: () => void;
}

export const useTemplatesStore = create<TemplatesStore>((set, get) => ({
    templates: [],
    selectedTemplate: null,

    isLoading: false,
    error: null,

    loadTemplates: async () => {
        try {
            set({ isLoading: true, error: null });

            const templates = await templatesService.getTemplates();

            set({
                templates,
                selectedTemplate: templates[0] || null,
                isLoading: false,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to load templates",
                isLoading: false,
            });
        }
    },

    createTemplate: async (payload) => {
        try {
            set({ isLoading: true, error: null });

            const newTemplate = await templatesService.createTemplate(payload);

            set({
                templates: [newTemplate, ...get().templates],
                selectedTemplate: newTemplate,
                isLoading: false,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to create template",
                isLoading: false,
            });

            throw error;
        }
    },

    updateTemplate: async (template, payload) => {
        try {
            const updatedTemplate = await templatesService.updateTemplate(
                template.id,
                payload
            );

            set({
                templates: get().templates.map((item) =>
                    item.id === updatedTemplate.id ? updatedTemplate : item
                ),
                selectedTemplate:
                    get().selectedTemplate?.id === updatedTemplate.id
                        ? updatedTemplate
                        : get().selectedTemplate,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to update template",
            });

            throw error;
        }
    },

    toggleTemplate: async (template) => {
        try {
            const updatedTemplate = await templatesService.toggleTemplate(
                template.id,
                !template.is_active
            );

            set({
                templates: get().templates.map((item) =>
                    item.id === updatedTemplate.id ? updatedTemplate : item
                ),
                selectedTemplate:
                    get().selectedTemplate?.id === updatedTemplate.id
                        ? updatedTemplate
                        : get().selectedTemplate,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to toggle template",
            });

            throw error;
        }
    },

    deleteTemplate: async (template) => {
        try {
            await templatesService.deleteTemplate(template.id);

            const remainingTemplates = get().templates.filter(
                (item) => item.id !== template.id
            );

            set({
                templates: remainingTemplates,
                selectedTemplate:
                    get().selectedTemplate?.id === template.id
                        ? remainingTemplates[0] || null
                        : get().selectedTemplate,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to delete template",
            });

            throw error;
        }
    },

    selectTemplate: (template) => {
        set({ selectedTemplate: template });
    },

    clearError: () => {
        set({ error: null });
    },
}));