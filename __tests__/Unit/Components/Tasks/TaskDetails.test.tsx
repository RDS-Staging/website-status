import { screen } from '@testing-library/react';
import TaskDetails from '@/components/taskDetails';
import { renderWithRouter } from '@/test_utils/createMockRouter';
import { Provider } from 'react-redux';
import { store } from '@/app/store';

const details = {
    url: 'https://realdevsquad.com/tasks/6KhcLU3yr45dzjQIVm0J/details',
    taskID: '6KhcLU3yr45dzjQIVm0J',
};

describe('TaskDetails Page', () => {
    test('Loading text rendered when loading', () => {
        renderWithRouter(
            <Provider store={store()}>
                <TaskDetails url={details.url} taskID={details.taskID} />
            </Provider>
        );
        const loadingElement = screen.getByText(/Loading.../i);
        expect(loadingElement).toBeInTheDocument();
    });
    test('Task title is Editable in Editing mode ', () => {
        renderWithRouter(
            <Provider store={store()}>
                <TaskDetails url={details.url} taskID={details.taskID} />
            </Provider>
        );

        const titleElement = screen.queryByTestId('task-title');
        expect(titleElement).not.toBeInTheDocument();
    });
    test('Edit button is not rendered when Editing', () => {
        renderWithRouter(
            <Provider store={store()}>
                <TaskDetails url={details.url} taskID={details.taskID} />
            </Provider>
        );

        const editButtonElement = screen.queryByRole('button', {
            name: 'Edit',
        });
        expect(editButtonElement).not.toBeInTheDocument();
    });
    test('Task Description is Editable in Editing mode', () => {
        renderWithRouter(
            <Provider store={store()}>
                <TaskDetails url={details.url} taskID={details.taskID} />
            </Provider>
        );

        const descriptionElement = screen.queryByText(
            /No description available/i
        );
        expect(descriptionElement).not.toBeInTheDocument();
    });
});
