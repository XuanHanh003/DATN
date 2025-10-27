import React from 'react';
import '../styles/team.css';

function Team() {
    const teamMembers = [
        {
            name: 'Linh Thảo (@linhthaotasty)',
            role: 'Mình đã thử rất nhiều loại đồ ăn vặt sấy khô, nhưng sản phẩm này thực sự ấn tượng! Giòn rụm, giữ được vị tự nhiên, lại còn ít dầu mỡ – chuẩn healthy snack!',
            image: '/images/daubep1.jpg',
        },
        {
            name: 'Nam Phong (@namphongfitlife)',
            role: 'Là người quan tâm đến sức khỏe, mình luôn chọn đồ ăn vặt ít đường, ít chất bảo quản. Sản phẩm này không chỉ ngon mà còn phù hợp cho chế độ ăn lành mạnh!',
            image: '/images/daubep2.jpg',
        },
        {
            name: 'Mai Anh (@maianhglowup)',
            role: 'Mê nhất món xoài sấy và mít sấy của shop! Không chỉ ngon mà còn đóng gói rất đẹp, tiện mang đi. Chắc chắn sẽ còn quay lại mua thêm!',
            image: '/images/daubep3.jpg',
        },
    ];
    return (
        <section className="team section-padding" id="employee">
            <div className="container">
                <div className="row">
                    <div className="section-title">
                        <h2 data-title="">KOLs đã kiểm chứng – Yên tâm trải nghiệm!</h2>
                    </div>
                </div>
                <div className="row">
                    {teamMembers.map((member, index) => (
                        <div className="team-items" key={index}>
                            <img src={member.image} alt={member.name} />
                            <div className="team-items-text">
                                <h2>{member.name}</h2>
                                <span>{member.role}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Team;