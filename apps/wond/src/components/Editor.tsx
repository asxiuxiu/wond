import './Editor.scss'
import LeftPanel from './LeftPanel/LeftPanel'
import RightPanel from './RightPanel/RightPanel'

const Editor = () => {
    return (
        <div className="wond-editor">
            <LeftPanel />
            <div className="paint"></div>
            <RightPanel />
        </div>
    )
}

export default Editor
