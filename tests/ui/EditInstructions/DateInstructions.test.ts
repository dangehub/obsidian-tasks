/**
 * @jest-environment jsdom
 */
import moment from 'moment';

import type { unitOfTime } from 'moment/moment';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { SetRelativeTaskDate, SetTaskDate } from '../../../src/ui/EditInstructions/DateInstructions';
import type { HappensDate } from '../../../src/DateTime/DateFieldTypes';
import type { Task } from '../../../src/Task/Task';

window.moment = moment;

const today = '2024-10-01';
const tomorrow = '2024-10-02';

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(today));
});

afterEach(() => {
    jest.useRealTimers();
});

const taskWithNoDates = new TaskBuilder().build();
const taskDueToday = new TaskBuilder().dueDate(today).build();
const taskDueTomorrow = new TaskBuilder().dueDate(tomorrow).build();

describe('SetTaskDate', () => {
    it('should provide information to set up a menu item for due date', () => {
        // Arrange
        const instruction = new SetTaskDate('dueDate', new Date(today));

        // Assert
        expect(instruction.instructionDisplayName()).toEqual('Set Date: Tue Oct 01 2024');
        expect(instruction.isCheckedForTask(taskWithNoDates)).toEqual(false);
        expect(instruction.isCheckedForTask(taskDueToday)).toEqual(true);
    });

    it('should create a menu item with a custom display name', () => {
        // Arrange
        const instruction = new SetTaskDate('dueDate', new Date(today), 'Apple Sauce');

        // Assert
        expect(instruction.instructionDisplayName()).toEqual('Apple Sauce');
    });

    it('should edit the date', () => {
        // Arrange
        const instruction = new SetTaskDate('dueDate', new Date(tomorrow));

        // Apply
        const newTasks = instruction.apply(taskWithNoDates);

        // Assert
        expect(newTasks.length).toEqual(1);
        expect(newTasks[0].dueDate).toEqualMoment(moment(tomorrow));
    });

    it('should not edit task if already has chosen date', () => {
        // Arrange
        const instruction = new SetTaskDate('dueDate', new Date(tomorrow));

        // Apply
        const newTasks = instruction.apply(taskDueTomorrow);

        // Assert
        expect(newTasks.length).toEqual(1);
        // Expect it is the same object
        expect(Object.is(newTasks[0], taskDueTomorrow)).toBe(true);
    });
});

describe('SetRelativeTaskDate', () => {
    function testSetRelativeTaskDate(
        task: Task,
        dateFieldToEdit: HappensDate,
        amount: number,
        timeUnit: unitOfTime.DurationConstructor,
        expectedTitle: string,
        expectedNewDate: moment.Moment,
    ) {
        // Arrange
        const instruction = new SetRelativeTaskDate(task, dateFieldToEdit, amount, timeUnit);

        // Apply
        const newTasks = instruction.apply(task);

        // Assert
        expect(instruction.instructionDisplayName()).toEqual(expectedTitle);
        expect(newTasks.length).toEqual(1);
        expect(newTasks[0].dueDate).toEqualMoment(expectedNewDate);
    }

    it('should postpone a task with a due date', () => {
        const dateFieldToEdit: HappensDate = 'dueDate';
        const amount: number = 1;
        const timeUnit: unitOfTime.DurationConstructor = 'day';
        const task = taskDueToday;
        const expectedTitle = 'Due tomorrow, on Wed 2nd Oct';
        const expectedNewDate = moment(tomorrow);

        testSetRelativeTaskDate(task, dateFieldToEdit, amount, timeUnit, expectedTitle, expectedNewDate);
    });

    it("should postpone a task without a due date, based on today's date", () => {
        // Arrange
        const dateFieldToEdit = 'startDate';
        const amount: number = 2;
        const timeUnit: unitOfTime.DurationConstructor = 'weeks';
        const task = taskWithNoDates;
        const expectedTitle = 'Start in 2 weeks, on Tue 15th Oct';
        const expectedNewDate = moment('2024-10-15');

        const instruction = new SetRelativeTaskDate(task, dateFieldToEdit, amount, timeUnit);

        // Apply
        const newTasks = instruction.apply(task);

        // Assert
        expect(instruction.instructionDisplayName()).toEqual(expectedTitle);
        expect(newTasks.length).toEqual(1);
        expect(newTasks[0][dateFieldToEdit]).toEqualMoment(expectedNewDate);
    });
});
