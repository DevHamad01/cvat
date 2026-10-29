// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import Alert from 'antd/lib/alert';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import Text from 'antd/lib/typography/Text';
import Title from 'antd/lib/typography/Title';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip,
} from 'chart.js';

import CVATLoadingSpinner from 'components/common/loading-spinner';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

interface ClassCount {
    label: string;
    count: number;
}

interface CountsResponse {
    task_id: number;
    total: number;
    counts: ClassCount[];
}

const BAR_HEIGHT_PX = 22;

function AnnotationCountsPage(): JSX.Element {
    const { tid } = useParams<{ tid: string }>();
    const [data, setData] = useState<CountsResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [fetching, setFetching] = useState(true);

    const load = useCallback(async () => {
        setFetching(true);
        setError(null);
        try {
            const response = await fetch(`/api/test/tasks/${tid}/annotation-counts`, {
                credentials: 'same-origin',
            });
            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }
            setData(await response.json());
        } catch (err) {
            setData(null);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setFetching(false);
        }
    }, [tid]);

    useEffect(() => {
        load();
    }, [load]);

    if (fetching) {
        return <CVATLoadingSpinner />;
    }

    if (error) {
        return (
            <div className='cvat-annotation-counts-page'>
                <Alert
                    type='error'
                    showIcon
                    message='Could not load annotation counts'
                    description={error}
                    action={<Button onClick={load}>Retry</Button>}
                />
            </div>
        );
    }

    if (!data || data.counts.length === 0) {
        return (
            <div className='cvat-annotation-counts-page'>
                <Empty description='This task has no annotations yet' />
            </div>
        );
    }

    return (
        <div className='cvat-annotation-counts-page'>
            <Title level={3}>{`Annotations per class, task #${data.task_id}`}</Title>
            <Text type='secondary'>{`${data.total} annotations in ${data.counts.length} classes`}</Text>
            <div style={{ height: data.counts.length * BAR_HEIGHT_PX + 60 }}>
                <Bar
                    data={{
                        labels: data.counts.map((item) => item.label),
                        datasets: [{
                            label: 'Annotations',
                            data: data.counts.map((item) => item.count),
                            backgroundColor: '#1890ff',
                        }],
                    }}
                    options={{
                        indexAxis: 'y',
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                    }}
                />
            </div>
        </div>
    );
}

export default AnnotationCountsPage;
