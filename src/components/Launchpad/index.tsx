import './index.scss';

import { inRange, range } from 'lodash';
import React, {
    CSSProperties,
    KeyboardEvent,
    useCallback,
    useEffect,
    useState,
} from 'react';

import CalculatorIcon from '../Dock/image/Calculator.png';
import ChromeIcon from '../Dock/image/Chrome.png';
import DrawingIcon from '../Dock/image/Drawing.png';
import PreferencesIcon from '../Dock/image/Preferences.png';
import DraggableIcon from './DraggableIcon';
import { DragEvent } from './DraggableIcon';

interface LaunchpadProps {
    showLaunchpad: boolean;
    setShowLaunchpad: React.Dispatch<React.SetStateAction<boolean>>;
    handleDockIconClick: (iconName: string) => void;
}

interface LaunchpadState {
    dragging: boolean; // true if any icon is being dragged.
    order: number[]; //the order of the icon IDs after dragging.
    temporaryOrder: number[]; // the temporary order of the icon IDs while dragging.
    draggedIconId: number | null; // the ID of the icon being dragged, null if no icon is being dragged.
}

const Launchpad: React.FC<LaunchpadProps> = (props: LaunchpadProps): JSX.Element => {
    const { showLaunchpad, setShowLaunchpad, handleDockIconClick } = props;
    const icons = [PreferencesIcon, ChromeIcon, CalculatorIcon, DrawingIcon];
    const iconIds = range(icons.length);
    const [state, setState] = useState<LaunchpadState>({
        dragging: false,
        order: iconIds,
        temporaryOrder: iconIds,
        draggedIconId: null,
    });

    const handleDrag = useCallback(
        (e: DragEvent) => {
            const { id, translation } = e;
            setState(state => ({ ...state, dragging: true }));
            const indexTranslated = Math.round(translation.x / 100);
            const index = state.order.indexOf(id);
            const temporaryOrder = state.order.filter(
                (orderId: number) => orderId !== id
            );
            if (!inRange(index + indexTranslated, 0, iconIds.length)) {
                return;
            }
            temporaryOrder.splice(index + indexTranslated, 0, id);
            setState(state => ({ ...state, temporaryOrder, draggedIconId: id }));
        },
        [state.order, iconIds.length]
    );

    const handleDragEnd = useCallback(() => {
        setState(state => ({
            ...state,
            order: state.temporaryOrder,
            draggedIconId: null,
        }));
    }, []);

    useEffect(() => {
        const handleClick = (e: Event): void => {
            const { target } = e;
            if (showLaunchpad === false) return;
            const iconImages = document.getElementsByClassName('LaunchpadImg');
            for (let i = 0; i < iconImages.length; i++) {
                if (iconImages[i] === target) {
                    return;
                }
            }
            setShowLaunchpad(false);
        };

        const handleKeyup = (e: Event): void => {
            const { key } = e as unknown as KeyboardEvent;
            if (key === 'Escape') {
                setShowLaunchpad(false);
            }
        };
        window.addEventListener('click', handleClick);
        window.addEventListener('keyup', handleKeyup);
        return (): void => {
            window.removeEventListener('click', handleClick);
            window.removeEventListener('keyup', handleKeyup);
        };
    }, [showLaunchpad]);

    const iconJsxElements: JSX.Element[] = icons.map((icon, iconId) => {
        const isDragging = state.draggedIconId === iconId;
        const top = state.temporaryOrder.indexOf(iconId) * 200;
        const draggedTop = state.order.indexOf(iconId) * 200;
        const fileName = icon.split('/').pop();
        const iconLabel = fileName?.split('.')[0];

        return (
            <DraggableIcon
                key={iconId}
                id={iconId}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
            >
                <div
                    className="LaunchpadItem"
                    style={
                        {
                            left: isDragging ? draggedTop : top,
                            transition: isDragging ? 'none' : 'all 500ms',
                        } as CSSProperties
                    }
                >
                    <div
                        className="LaunchpadImg"
                        style={
                            {
                                backgroundImage: 'url(' + icon + ')',
                                backgroundPosition: 'center',
                                backgroundSize: 'cover',
                                backgroundRepeat: 'no-repeat',
                            } as CSSProperties
                        }
                        onClick={() => {
                            if (!state.dragging) {
                                handleDockIconClick(icon);
                            } else {
                                setState(state => ({ ...state, dragging: false }));
                            }
                        }}
                    />
                    <span style={{ color: '#fff' }}>{iconLabel}</span>
                </div>
            </DraggableIcon>
        );
    });

    return (
        <React.Fragment>
            {showLaunchpad && (
                <div id="Launchpad">
                    <div id="LaunchpadItemWrapper">{iconJsxElements}</div>
                </div>
            )}
        </React.Fragment>
    );
};

export default Launchpad;
