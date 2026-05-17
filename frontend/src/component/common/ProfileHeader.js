import React from 'react';
import {
  formatExperience,
  formatRating,
  getChefCity,
  getChefInitial,
  getChefPhoto,
  getPrimarySpecialty
} from '../../utils/chefMarketplace';
import '../../style/ChefShared.css';

const ProfileHeader = ({
  user,
  title,
  subtitle = 'Professional Chef',
  badgeLabel = 'Verified Chef',
  showDefaultMeta = true,
  metaItems = [],
  actions = null,
  onEditPhoto = null,
  compact = false
}) => {
  const displayName = title || user?.name || 'Home Chef';
  const defaultMetaItems = showDefaultMeta ? [
    { label: 'Location', value: getChefCity(user) },
    { label: 'Specialty', value: getPrimarySpecialty(user) },
    { label: 'Experience', value: formatExperience(user) }
  ] : [];

  return (
    <section className={`hf-profile-header ${compact ? 'hf-profile-header-compact' : ''}`}>
      <div className="hf-profile-cover" />
      <div className="hf-profile-body">
        <div className="hf-profile-avatar-wrap">
          <div className="hf-profile-avatar">
            {getChefPhoto(user) ? (
              <img src={getChefPhoto(user)} alt={displayName} />
            ) : (
              <span>{getChefInitial(user)}</span>
            )}
          </div>
          <span className="hf-profile-badge" aria-label={badgeLabel}>OK</span>
          {onEditPhoto && (
            <button type="button" className="hf-profile-photo-btn" onClick={onEditPhoto}>
              Edit
            </button>
          )}
        </div>

        <div className="hf-profile-copy">
          <div className="hf-profile-title-row">
            <h1>{displayName}</h1>
            {badgeLabel && <span className="hf-profile-verified">{badgeLabel}</span>}
          </div>
          {subtitle && <p className="hf-profile-subtitle">{subtitle}</p>}

          <div className="hf-profile-rating" aria-label={`Rating ${formatRating(user)} out of 5`}>
            <span className="hf-profile-rating-mark" aria-hidden="true">*</span>
            <strong>{formatRating(user)}</strong>
            <span>rating</span>
          </div>

          <div className="hf-profile-meta">
            {[...defaultMetaItems, ...metaItems].filter((item) => item?.value).map((item) => (
              <span key={`${item.label}-${item.value}`}>
                <strong>{item.label}</strong>
                {item.value}
              </span>
            ))}
          </div>
        </div>

        {actions && <div className="hf-profile-actions">{actions}</div>}
      </div>
    </section>
  );
};

export default ProfileHeader;
