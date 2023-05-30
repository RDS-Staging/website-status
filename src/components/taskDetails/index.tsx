import React, {
    ChangeEvent,
    FC,
    useEffect,
    useContext,
    useReducer,
    useRef,
    useState,
    ChangeEventHandler,
} from 'react';
import useFetch from '@/hooks/useFetch';
import NavBar from '@/components/navBar/index';
import TaskContainer from './TaskContainer';
import Details from './Details';
import { isUserAuthorizedContext } from '@/context/isUserAuthorized';
import taskDetailsReducer from './taskDetails.reducer';
import { toast, ToastTypes } from '@/helperFunctions/toast';
import updateTaskDetails from '@/helperFunctions/updateTaskDetails';
import convertTimeStamp from '@/helperFunctions/convertTimeStamp';
import task from '@/interfaces/task.type';
import classNames from './task-details.module.scss';
import { useRouter } from 'next/router';
import { TASKS_URL } from '@/constants/url';
import fetch from '@/helperFunctions/fetch';
import Link from 'next/link';

type ButtonProps = {
    buttonName: string;
    clickHandler: (value: any) => void;
    value?: boolean;
};
type TextAreaProps = {
    name: string;
    value: string;
    onChange: ChangeEventHandler;
};
function Button(props: ButtonProps) {
    const { buttonName, clickHandler, value } = props;

    return (
        <button
            type="button"
            className={classNames['button']}
            onClick={() => clickHandler(value)}
        >
            {buttonName}
        </button>
    );
}
function Textarea(props: TextAreaProps) {
    const { name, value, onChange } = props;
    return (
        <textarea
            className={classNames['textarea']}
            name={name}
            value={value}
            data-testid="edit button"
            onChange={onChange}
        />
    );
}

type Props = {
    url: string;
    taskID: string;
};

const initialState = {
    taskDetails: {} as task,
    editedDetails: {} as task,
};

const TaskDetails: FC<Props> = ({ url, taskID }) => {
    const router = useRouter();
    const isAuthorized = useContext(isUserAuthorizedContext);
    const [state, dispatch] = useReducer(taskDetailsReducer, initialState);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [taskTitle, setTaskTitle] = useState<string[]>([]);
    const [id, setId] = useState<string[]>([]);
    const [isFetched, setIsFetched] = useState<boolean>(false);
    const initialDataRef = useRef<Record<string, any> | task>({});
    const { response, error, isLoading } = useFetch(url);
    const { SUCCESS, ERROR } = ToastTypes;
    const { taskDetails } = state;
    useEffect(() => {
        const fetchedData: task = { ...response.taskData };
        dispatch({ type: 'setTaskDetails', payload: fetchedData });
        initialDataRef.current = fetchedData;
    }, [isLoading, response]);

    function handleChange(
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
        const formData = {
            [event.target.name]: event.target.value,
        };
        dispatch({ type: 'setEditedDetails', payload: formData });
        dispatch({ type: 'setTaskDetails', payload: formData });
    }

    function onCancel() {
        setIsEditing(false);
        dispatch({ type: 'reset' });
        dispatch({ type: 'setTaskDetails', payload: initialDataRef.current });
    }

    async function onSave() {
        setIsEditing(false);
        try {
            const responseData = await updateTaskDetails(
                state.editedDetails,
                taskID
            );
            if (responseData.status === 204) {
                initialDataRef.current = state.taskDetails;
                toast(SUCCESS, 'Successfully saved');
            }
        } catch (err) {
            toast(ERROR, 'Could not save changes');
            dispatch({
                type: 'setTaskDetails',
                payload: initialDataRef.current,
            });
        }
        dispatch({ type: 'reset', payload: initialDataRef.current });
    }

    function renderLoadingComponent() {
        if (isLoading) {
            return <p className={classNames.textCenter}>Loading...</p>;
        }
        if (error) {
            return (
                <p className={classNames.textCenter}>Something went wrong!</p>
            );
        }
    }

    const shouldRenderParentContainer = () =>
        !isLoading && !error && taskDetails;
    console.log(typeof taskDetails?.dependsOn);
    const fetchDependentTasks = async (taskDetails: any) => {
        try {
            if (taskDetails?.dependsOn) {
                const dependsOnTitles = await Promise.all(
                    taskDetails.dependsOn.map(async (taskId: string) => {
                        const { requestPromise } = fetch({
                            url: `${TASKS_URL}/${taskId}/details`,
                        });
                        const data = await requestPromise;
                        return [data?.data?.taskData?.title, taskId];
                    })
                );
                console.log(dependsOnTitles);
                const titles = dependsOnTitles.map(
                    (innerArray) => innerArray[0]
                );
                const ids = dependsOnTitles.map(
                    (innerArrays) => innerArrays[1]
                );
                setTaskTitle(titles);
                setId(ids);
                setIsFetched(true);
            }
        } catch (error) {
            console.error('Error while fetching taskdependency', error);
        }
    };

    if (taskDetails && !isFetched) {
        fetchDependentTasks(taskDetails);
    }
    const navigateToTask = (taskId: string) => {
        router.push(`/tasks/${taskId}`);
    };
    return (
        <>
            <NavBar />
            {renderLoadingComponent()}
            {shouldRenderParentContainer() && (
                <div className={classNames.parentContainer}>
                    <div className={classNames.titleContainer}>
                        {isEditing ? (
                            <Textarea
                                name="title"
                                value={taskDetails?.title}
                                onChange={handleChange}
                            />
                        ) : (
                            <span
                                data-testid="task-title"
                                className={classNames.taskTitle}
                            >
                                {taskDetails?.title}
                            </span>
                        )}
                        {!isEditing ? (
                            isAuthorized && (
                                <Button
                                    buttonName="Edit"
                                    clickHandler={setIsEditing}
                                    value={true}
                                />
                            )
                        ) : (
                            <div className={classNames.editMode}>
                                <Button
                                    buttonName="Cancel"
                                    clickHandler={onCancel}
                                />
                                <Button
                                    buttonName="Save"
                                    clickHandler={onSave}
                                />
                            </div>
                        )}
                    </div>

                    <section className={classNames.detailsContainer}>
                        <section className={classNames.leftContainer}>
                            <TaskContainer title="Description" hasImg={false}>
                                {isEditing ? (
                                    <Textarea
                                        name="purpose"
                                        value={taskDetails?.purpose}
                                        onChange={handleChange}
                                    />
                                ) : (
                                    <p>
                                        {!taskDetails?.purpose
                                            ? 'No description available'
                                            : taskDetails?.purpose}
                                    </p>
                                )}
                            </TaskContainer>
                            <TaskContainer title="Details" hasImg={false}>
                                <div
                                    className={
                                        classNames['sub_details_grid_container']
                                    }
                                >
                                    <Details
                                        detailType={'Type'}
                                        value={taskDetails?.type}
                                    />
                                    <Details
                                        detailType={'Priority'}
                                        value={taskDetails?.priority}
                                    />
                                    <Details
                                        detailType={'Status'}
                                        value={taskDetails?.status}
                                    />
                                    <Details
                                        detailType={'Link'}
                                        value={taskDetails?.featureUrl}
                                    />
                                </div>
                            </TaskContainer>
                            <TaskContainer
                                title="Task DependsOn"
                                hasImg={false}
                            >
                                <div
                                    className={
                                        classNames['sub_details_grid_container']
                                    }
                                >
                                    <Details
                                        detailType="task titles"
                                        value={' '}
                                    />
                                    {taskTitle.map((title, index) => (
                                        <Link
                                            href={`/tasks/${id[index]}`}
                                            key={index}
                                        >
                                            <div
                                                onClick={() =>
                                                    navigateToTask(id[index])
                                                }
                                            >
                                                {title}
                                            </div>
                                        </Link>
                                    ))}
                                    {taskTitle.length === 0 && (
                                        <div>No Dependency</div>
                                    )}
                                </div>
                            </TaskContainer>
                        </section>

                        <section className={classNames.rightContainer}>
                            <button
                                onClick={() =>
                                    router.push(`/progress/${taskID}?dev=true`)
                                }
                            >
                                Update Progress
                            </button>
                            <TaskContainer
                                src="/participant_logo.png"
                                title="Participants"
                                hasImg={true}
                            >
                                <Details
                                    detailType={'Assignee'}
                                    value={
                                        taskDetails?.type === 'feature'
                                            ? taskDetails?.assignee
                                            : taskDetails?.participants?.join(
                                                  ' , '
                                              )
                                    }
                                />
                                <Details
                                    detailType={'Reporter'}
                                    value={'Ankush'}
                                />
                            </TaskContainer>
                            <TaskContainer
                                src="/calendar-icon.png"
                                title="Dates"
                                hasImg={true}
                            >
                                <Details
                                    detailType={'StartedOn'}
                                    value={convertTimeStamp(
                                        taskDetails?.startedOn
                                    )}
                                />
                                <Details
                                    detailType={'EndsOn'}
                                    value={convertTimeStamp(
                                        taskDetails?.endsOn
                                    )}
                                />
                            </TaskContainer>
                        </section>
                    </section>
                </div>
            )}
        </>
    );
};

export default TaskDetails;
