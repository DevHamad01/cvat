// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import Alert from 'antd/lib/alert';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import Select from 'antd/lib/select';
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

const SHAPE_TYPE_OPTIONS = [
    { value: 'all', label: 'All shape types' },
    { value: 'polygon', label: 'Polygon' },
    { value: 'mask', label: 'Mask' },
];

function AnnotationCountsPage(): JSX.Element {
    const { tid } = useParams<{ tid: string }>();
    const [data, setData] = useState<CountsResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [fetching, setFetching] = useState(true);
    const [shapeType, setShapeType] = useState('all');

    const load = useCallback(async () => {
        setFetching(true);
        setError(null);
        try {
            const query = shapeType === 'all' ? '' : `?type=${shapeType}`;
            const response = await fetch(`/api/test/tasks/${tid}/annotation-counts${query}`, {
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
    }, [tid, shapeType]);

    useEffect(() => {
        load();
    }, [load]);

    let content: JSX.Element;
    if (fetching) {
        content = <CVATLoadingSpinner />;
    } else if (error) {
        content = (
            <Alert
                type='error'
                showIcon
                message='Could not load annotation counts'
                description={error}
                action={<Button onClick={load}>Retry</Button>}
            />
        );
    } else if (!data || data.counts.length === 0) {
        content = <Empty description='No annotations match this selection' />;
    } else {
        content = (
            <>
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
            </>
        );
    }

    return (
        <div className='cvat-annotation-counts-page'>
            <Title level={3}>{`Annotations per class, task #${tid}`}</Title>
            <Select
                value={shapeType}
                options={SHAPE_TYPE_OPTIONS}
                onChange={setShapeType}
                style={{ width: 200, marginBottom: 12 }}
            />
            <div>{content}</div>
        </div>
    );
}

export default AnnotationCountsPage;
