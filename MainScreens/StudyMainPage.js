import PagerView from 'react-native-pager-view';
import StudyTimerPage from './StudyTimerPage';
import StudyStatsPage from './StudyStatsPage';
import { StyleSheet, Text, View} from 'react-native';
import { useState, useRef } from 'react';

const StudyMainPage = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const pagerRef = useRef(null);

    const goToNextPage = () => {
        if (currentPage < 1) {
            pagerRef.current.setPage(currentPage + 1);
            setCurrentPage(currentPage + 1);
        }
    }
    
    const goToPrevPage = () => {
        if (currentPage > 0) {
            pagerRef.current.setPage(currentPage - 1);
            setCurrentPage(currentPage - 1);
        }
    }

    const handlePageSelected = (e) => {
        setCurrentPage(e.nativeEvent.position);
    };

    
    return (
        <PagerView 
            style={styles.pagerView} 
            initialPage={0} 
            ref={pagerRef} 
            onPageSelected={handlePageSelected}
        >
            <View key="1">
                <StudyTimerPage goToNextPage={goToNextPage} />
            </View>
            <View key="2">
                <StudyStatsPage 
                    goToPrevPage={goToPrevPage} 
                    isActive={currentPage === 1}  // Pass isActive as true when StudyStatsPage is active
                />
            </View>
        </PagerView>
    );
}

const styles = StyleSheet.create({
    pagerView: {
        flex: 1,
        backgroundColor: "white"
    },
});

export default StudyMainPage;