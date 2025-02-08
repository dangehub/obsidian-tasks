import type { OptionalTasksFile, TasksFile } from '../Scripting/TasksFile';
import { Query } from './Query';

// Enum for handler types
enum Handler {
    Instruction = 'instruction',
    ShowAndHide = 'showAndHide',
    AddValue = 'addValue',
}

// Note: This file is excluded from SonarCloud duplication-checks,
//       as the duplication here provides clarity.
// Instructions are listed in the order that items are displayed in Tasks search results
const queryProperties = [
    {
        name: 'TQ_explain',
        display: 'explain',
        handler: Handler.Instruction,
        trueValue: 'explain',
        falseValue: '',
    },
    {
        name: 'TQ_short_mode',
        display: 'short mode',
        handler: Handler.Instruction,
        trueValue: 'short mode',
        falseValue: 'full mode',
    },
    {
        name: 'TQ_show_tree',
        display: 'tree',
        handler: Handler.ShowAndHide,
    },

    // Fields that appear before date values:
    {
        name: 'TQ_show_tags',
        display: 'tags',
        handler: Handler.ShowAndHide,
    },
    {
        name: 'TQ_show_id',
        display: 'id',
        handler: Handler.ShowAndHide,
    },
    {
        name: 'TQ_show_depends_on',
        display: 'depends on',
        handler: Handler.ShowAndHide,
    },
    {
        name: 'TQ_show_priority',
        display: 'priority',
        handler: Handler.ShowAndHide,
    },
    {
        name: 'TQ_show_recurrence_rule',
        display: 'recurrence rule',
        handler: Handler.ShowAndHide,
    },
    {
        name: 'TQ_show_on_completion',
        display: 'on completion',
        handler: Handler.ShowAndHide,
    },

    // Date fields:
    {
        name: 'TQ_show_created_date',
        display: 'created date',
        handler: Handler.ShowAndHide,
    },
    {
        name: 'TQ_show_start_date',
        display: 'start date',
        handler: Handler.ShowAndHide,
    },
    {
        name: 'TQ_show_scheduled_date',
        display: 'scheduled date',
        handler: Handler.ShowAndHide,
    },
    {
        name: 'TQ_show_due_date',
        display: 'due date',
        handler: Handler.ShowAndHide,
    },
    {
        name: 'TQ_show_cancelled_date',
        display: 'cancelled date',
        handler: Handler.ShowAndHide,
    },
    {
        name: 'TQ_show_done_date',
        display: 'done date',
        handler: Handler.ShowAndHide,
    },

    // Elements of query results:
    {
        name: 'TQ_show_urgency',
        display: 'urgency',
        handler: Handler.ShowAndHide,
    },
    {
        name: 'TQ_show_backlink',
        display: 'backlink',
        handler: Handler.ShowAndHide,
    },
    {
        name: 'TQ_show_edit_button',
        display: 'edit button',
        handler: Handler.ShowAndHide,
    },
    {
        name: 'TQ_show_postpone_button',
        display: 'postpone button',
        handler: Handler.ShowAndHide,
    },
    {
        name: 'TQ_show_task_count',
        display: 'task count',
        handler: Handler.ShowAndHide,
    },
    {
        name: 'TQ_extra_instructions',
        handler: Handler.AddValue,
    },
];

/**
 * Construct query instructions from Obsidian properties in the query file
 */
export class QueryFileDefaults {
    public source(queryFile: OptionalTasksFile) {
        if (!queryFile) {
            return '';
        }

        const instructions = queryProperties.map((prop) => this.generateInstruction(queryFile, prop));
        return instructions.filter((i) => i !== '').join('\n');
    }

    private generateInstruction(queryFile: TasksFile, prop: any) {
        const hasProperty = queryFile.hasProperty(prop.name);
        const value = queryFile.property(prop.name);
        switch (prop.handler) {
            case Handler.Instruction:
                return (hasProperty && (value ? prop.trueValue : prop.falseValue)) || '';
            case Handler.ShowAndHide:
                return (hasProperty && (value ? 'show ' + prop.display : 'hide ' + prop.display)) || '';
            case Handler.AddValue:
                return hasProperty ? value || '' : '';
            default:
                throw new Error('Unknown handler type: ' + prop.handler + '.');
        }
    }

    public query(queryFile: OptionalTasksFile) {
        return new Query(this.source(queryFile), queryFile);
    }

    /**
     * Return text that creates MetaBind widgets for users to edit query file defaults.
     */
    public metaBindPluginWidgets() {
        // This is initially hard-coded, though I intend to machine-generate it eventually.
        // Its text is embedded in the test vault and in the user guide.
        return `
short mode: \`INPUT[toggle:TQ_short_mode]\`
tree: \`INPUT[toggle:TQ_show_tree]\`
tags: \`INPUT[toggle:TQ_show_tags]\`
id: \`INPUT[toggle:TQ_show_id]\` depends on: \`INPUT[toggle:TQ_show_depends_on]\`
priority: \`INPUT[toggle:TQ_show_priority]\`
recurrence rule: \`INPUT[toggle:TQ_show_recurrence_rule]\` on completion: \`INPUT[toggle:TQ_show_on_completion]\`
start date: \`INPUT[toggle:TQ_show_start_date]\` scheduled date: \`INPUT[toggle:TQ_show_scheduled_date]\` due date: \`INPUT[toggle:TQ_show_due_date]\`
created date: \`INPUT[toggle:TQ_show_created_date]\` cancelled date: \`INPUT[toggle:TQ_show_cancelled_date]\` done date: \`INPUT[toggle:TQ_show_done_date]\`
urgency: \`INPUT[toggle:TQ_show_urgency]\`
backlink: \`INPUT[toggle:TQ_show_backlink]\`
edit button: \`INPUT[toggle:TQ_show_edit_button]\` postpone button: \`INPUT[toggle:TQ_show_postpone_button]\`
task count: \`INPUT[toggle:TQ_show_task_count]\`
extra instructions: \`INPUT[textArea:TQ_extra_instructions]\`
explain: \`INPUT[toggle:TQ_explain]\`
`;
    }
}
